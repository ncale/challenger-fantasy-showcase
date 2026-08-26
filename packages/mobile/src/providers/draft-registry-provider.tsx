import { type DraftServerMessage, draftServerMessageSchema } from "@challenger-fantasy/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { type DraftGroupSession, DraftRegistryContext } from "~/contexts/draft-registry-context";
import { useAppSettings } from "~/hooks/use-app-settings";
import { useSupabase } from "~/hooks/use-supabase";
import { env } from "~/lib/env";
import { userSubmissionCountsQuery } from "~/lib/init-queries";
import { mobileLogger } from "~/lib/logger";
import { draftGroupStorage } from "~/lib/storage";

const RECONNECT_DELAY_MS = 3_000;

interface DraftRegistryProviderProps {
  children: ReactNode;
}

export function DraftRegistryProvider({ children }: DraftRegistryProviderProps) {
  const { session: authSession, userId } = useSupabase();
  const { appConfig } = useAppSettings();
  const queryClient = useQueryClient();

  // * Latest values ref for use inside WS callbacks (which close over stale state)
  const authSessionRef = useRef(authSession);
  useEffect(() => {
    authSessionRef.current = authSession;
  }, [authSession]);

  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Sessions drives re-renders; sessionsRef is the synchronous source of truth
  // used inside WebSocket callbacks (which close over stale state otherwise).
  const [sessions, setSessions] = useState<Record<string, DraftGroupSession>>({});
  const sessionsRef = useRef<Record<string, DraftGroupSession>>({});

  const [selectedDraftGroupId, setSelectedDraftGroupId] = useState<string | null>(null);
  const selectedDraftGroupIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedDraftGroupIdRef.current = selectedDraftGroupId;
  }, [selectedDraftGroupId]);

  const selectDraft = useCallback((id: string | null) => {
    setSelectedDraftGroupId(id);
  }, []);

  // Active WebSocket per draftGroupId
  const socketsRef = useRef<Record<string, WebSocket>>({});

  // Pending reconnect timeouts per draftGroupId — cleared on explicit leave or unmount
  const reconnectTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function updateSession(draftGroupId: string, partial: Partial<DraftGroupSession>) {
    sessionsRef.current = {
      ...sessionsRef.current,
      [draftGroupId]: {
        draftGroupId,
        gameId: null,
        draftState: null,
        ...sessionsRef.current[draftGroupId],
        ...partial,
      },
    };
    setSessions({ ...sessionsRef.current });
  }

  function removeSession(draftGroupId: string) {
    const next = { ...sessionsRef.current };
    delete next[draftGroupId];
    sessionsRef.current = next;
    setSessions({ ...next });
  }

  function openSocket(
    accessToken: string,
    params: { kind: "by-game"; gameId: string } | { kind: "by-group"; draftGroupId: string },
  ) {
    const url = new URL(`${env.EXPO_PUBLIC_API_WEBSOCKET_URL}/v1/drafts/join`);
    url.searchParams.set("accessToken", accessToken);

    // draftGroupId is known upfront for reconnections; resolved from connection-info for new joins
    let resolvedDraftGroupId: string | null =
      params.kind === "by-group" ? params.draftGroupId : null;
    const knownGameId = params.kind === "by-game" ? params.gameId : null;

    if (params.kind === "by-group") {
      url.searchParams.set("draftGroupId", params.draftGroupId);
    } else {
      url.searchParams.set("gameId", params.gameId);
    }

    const ws = new WebSocket(url.toString());

    if (params.kind === "by-group") {
      socketsRef.current[params.draftGroupId] = ws;
    }

    ws.onopen = () => mobileLogger.ws.info({ kind: params.kind, gameId: knownGameId }, "ws.open");

    ws.onmessage = (e) => {
      const raw = JSON.parse(e.data);
      // Users arrives as an array over the wire; restore to Set for the schema
      if (raw.payload?.users) {
        raw.payload.users = new Set(raw.payload.users);
      }
      const parsed = draftServerMessageSchema.safeParse(raw);
      if (!parsed.success) {
        mobileLogger.ws.error({ issues: parsed.error.issues }, "message.parse.error");
        return;
      }

      mobileLogger.ws.debug({ kind: parsed.data.kind }, "message.receive");

      switch (parsed.data.kind) {
        case "connection-info": {
          resolvedDraftGroupId = parsed.data.payload.draftGroupId;
          const resolvedGameId = parsed.data.payload.gameId;
          socketsRef.current[resolvedDraftGroupId] = ws;
          draftGroupStorage.addGroupId(resolvedDraftGroupId);
          updateSession(resolvedDraftGroupId, { gameId: resolvedGameId });
          if (knownGameId) {
            // Explicit join (by-game) — select this draft for navigation
            setSelectedDraftGroupId(resolvedDraftGroupId);
          }
          mobileLogger.draft.info(
            { draftGroupId: resolvedDraftGroupId, gameId: resolvedGameId },
            "session.connect",
          );
          break;
        }
        case "draft-state": {
          if (!resolvedDraftGroupId) return;
          updateSession(resolvedDraftGroupId, { draftState: parsed.data.payload });
          mobileLogger.draft.debug(
            { draftGroupId: resolvedDraftGroupId, status: parsed.data.payload.status },
            "state.update",
          );
          if (parsed.data.payload.status === "completed") {
            mobileLogger.draft.info({ draftGroupId: resolvedDraftGroupId }, "draft.complete");
            draftGroupStorage.removeGroupId(resolvedDraftGroupId);
            const uid = userIdRef.current;
            if (uid) {
              queryClient.invalidateQueries({ queryKey: userSubmissionCountsQuery(uid).queryKey });
            }
            if (selectedDraftGroupIdRef.current !== resolvedDraftGroupId) {
              leaveDraft(resolvedDraftGroupId);
            }
          }
          break;
        }
      }
    };

    // * Delete ws ref and start reconnection ping
    ws.onclose = () => {
      mobileLogger.ws.info({ draftGroupId: resolvedDraftGroupId }, "ws.close");
      if (resolvedDraftGroupId) {
        const groupId = resolvedDraftGroupId;
        delete socketsRef.current[groupId];
        reconnectTimeoutsRef.current[groupId] = setTimeout(() => {
          delete reconnectTimeoutsRef.current[groupId];
          const currentSession = authSessionRef.current;
          if (!currentSession) return;
          if (socketsRef.current[groupId]) return; // already reconnected
          draftGroupStorage.getAll().then((ids) => {
            if (!ids.includes(groupId)) return; // draft completed or explicitly left
            mobileLogger.draft.info({ draftGroupId: groupId }, "ws.reconnect");
            openSocket(currentSession.access_token, { kind: "by-group", draftGroupId: groupId });
          });
        }, RECONNECT_DELAY_MS);
      }
    };

    ws.onerror = (e) =>
      mobileLogger.ws.error({ kind: params.kind, gameId: knownGameId, type: e.type }, "ws.error");
  }

  // * Auto-reconnect runs one time once the auth session is available
  const hasReconnected = useRef(false);
  useEffect(() => {
    if (!authSession || hasReconnected.current) return;
    hasReconnected.current = true;

    draftGroupStorage.getAll().then((ids) => {
      if (ids.length > 0) {
        mobileLogger.draft.info({ count: ids.length }, "session.reconnect");
      }
      for (const draftGroupId of ids) {
        openSocket(authSession.access_token, { kind: "by-group", draftGroupId });
      }
    });
  }, [authSession]);

  // * Close all sockets and cancel pending reconnects on unmount
  useEffect(() => {
    return () => {
      for (const ws of Object.values(socketsRef.current)) {
        ws.close();
      }
      for (const timeout of Object.values(reconnectTimeoutsRef.current)) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const maxConcurrentDrafts = appConfig.maxConcurrentDrafts;

  /** Request to join any active draft lobby for a particular game */
  const joinDraft = useCallback(
    (gameId: string): boolean => {
      if (!authSession) return false;
      if (Object.keys(sessionsRef.current).length >= maxConcurrentDrafts) {
        mobileLogger.draft.warn({ gameId, limit: maxConcurrentDrafts }, "lobby.join.limit");
        Alert.alert(
          "Too many active drafts",
          `You can only be in ${maxConcurrentDrafts} drafts at a time. Leave one before joining another.`,
        );
        return false;
      }
      mobileLogger.draft.info({ gameId }, "lobby.join");
      openSocket(authSession.access_token, { kind: "by-game", gameId });
      return true;
    },
    [authSession, maxConcurrentDrafts],
  );

  /**  */
  const leaveDraft = useCallback((draftGroupId: string) => {
    mobileLogger.draft.info({ draftGroupId }, "draft.leave");
    clearTimeout(reconnectTimeoutsRef.current[draftGroupId]);
    delete reconnectTimeoutsRef.current[draftGroupId];
    socketsRef.current[draftGroupId]?.close();
    delete socketsRef.current[draftGroupId];
    draftGroupStorage.removeGroupId(draftGroupId);
    removeSession(draftGroupId);
    setSelectedDraftGroupId((prev) => (prev === draftGroupId ? null : prev));
  }, []);

  const pickFighter = useCallback((draftGroupId: string, fighterId: string) => {
    const ws = socketsRef.current[draftGroupId];
    if (!ws) return;
    mobileLogger.draft.debug({ draftGroupId, fighterId }, "pick.fighter");
    ws.send(
      JSON.stringify({
        kind: "fighter-pick",
        payload: { fighterId, timestamp: Date.now() },
      } satisfies DraftServerMessage),
    );
  }, []);

  const isDrafting = Object.keys(sessions).length > 0;

  const value = useMemo(
    () => ({
      sessions,
      isDrafting,
      selectedDraftGroupId,
      selectDraft,
      joinDraft,
      leaveDraft,
      pickFighter,
    }),
    [sessions, isDrafting, selectedDraftGroupId, selectDraft, joinDraft, leaveDraft, pickFighter],
  );

  return <DraftRegistryContext.Provider value={value}>{children}</DraftRegistryContext.Provider>;
}
