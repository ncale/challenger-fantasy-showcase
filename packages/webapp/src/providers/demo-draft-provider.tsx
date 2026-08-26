import { getApiUrls } from "@challenger-fantasy/core";
import {
  type DraftServerMessage,
  type DraftState,
  draftServerMessageSchema,
} from "@challenger-fantasy/schemas";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DemoDraftContext } from "~/contexts/demo-draft-context";
import { envClient } from "~/lib/env-client";

function ssGet(key: string): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(key);
}

function ssSet(key: string, value: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(key, value);
}

function getOrCreateDemoUserId(): string {
  const key = "challenger-demo-user-id";
  let id = ssGet(key);
  if (!id) {
    id = crypto.randomUUID();
    ssSet(key, id);
  }
  return id;
}

export const DemoDraftProvider = ({ children }: { children: ReactNode }) => {
  // Start empty on both server and client — populated from sessionStorage after mount.
  const [username, setUsernameState] = useState("");
  const [myUserId, setMyUserId] = useState("");

  useEffect(() => {
    setUsernameState(ssGet("challenger-demo-username") ?? "");
    setMyUserId(getOrCreateDemoUserId());
  }, []);

  const setUsername = useCallback((name: string) => {
    ssSet("challenger-demo-username", name);
    setUsernameState(name);
  }, []);

  // Per-game WebSocket connections (ref — mutations don't need re-renders)
  const wsMap = useRef<Map<string, WebSocket>>(new Map());

  /**
   * gameStates[gameId]:
   *   undefined  → not joined
   *   null       → WS open, waiting for first state message
   *   DraftState → live state from server
   */
  const [gameStates, setGameStates] = useState<Record<string, DraftState | null | undefined>>({});

  // Keep a ref in sync so leaveGame can read latest state without
  // becoming a new function reference on every gameStates change.
  const gameStatesRef = useRef(gameStates);
  useEffect(() => {
    gameStatesRef.current = gameStates;
  });

  const joinGame = useCallback(
    (gameId: string, joinUsername: string) => {
      if (wsMap.current.has(gameId)) return; // already connected
      if (!joinUsername || !myUserId) return;

      const { ws: wsBaseUrl } = getApiUrls(envClient.VITE_API_URL);
      const url = `${wsBaseUrl}/v1/games/${gameId}/join-demo?username=${encodeURIComponent(joinUsername)}&userId=${myUserId}`;

      const socket = new WebSocket(url);
      wsMap.current.set(gameId, socket);

      // Mark as "connecting" immediately so the lobby can show a spinner
      setGameStates((prev) => ({ ...prev, [gameId]: null }));

      socket.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data);
          const normalized =
            raw?.payload?.users != null
              ? { ...raw, payload: { ...raw.payload, users: new Set(raw.payload.users) } }
              : raw;
          const parsed = draftServerMessageSchema.safeParse(normalized);
          if (parsed.success && parsed.data.kind === "draft-state") {
            setGameStates((prev) => ({ ...prev, [gameId]: parsed.data.payload }));
          }
        } catch (err) {
          console.error("[demo] message error", err);
        }
      };

      socket.onclose = () => {
        wsMap.current.delete(gameId);
        setGameStates((prev) => {
          const currentState = prev[gameId];
          // Keep state around if draft completed so the overlay can render
          if (currentState?.status === "completed") return prev;
          const next = { ...prev };
          delete next[gameId];
          return next;
        });
      };

      socket.onerror = (e) => console.error("[demo] ws error", e);
    },
    [myUserId],
  );

  const leaveGame = useCallback((gameId: string) => {
    const state = gameStatesRef.current[gameId];
    // Already gone or undefined — nothing to do
    if (state === undefined) return;
    // Only disconnect if draft hasn't started (pending or still connecting)
    if (state === null || state.status === "pending") {
      const socket = wsMap.current.get(gameId);
      // Closing the socket triggers onclose which removes state
      socket?.close();
    }
  }, []);

  const pickFighter = useCallback((gameId: string, fighterId: string) => {
    const socket = wsMap.current.get(gameId);
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(
      JSON.stringify({
        kind: "fighter-pick",
        payload: { fighterId, timestamp: Date.now() },
      } satisfies DraftServerMessage),
    );
  }, []);

  const inProgressGameIds = useMemo(
    () =>
      Object.entries(gameStates)
        .filter(([, s]) => s != null && (s.status === "initializing" || s.status === "in-progress"))
        .map(([id]) => id),
    [gameStates],
  );

  return (
    <DemoDraftContext.Provider
      value={{
        username,
        setUsername,
        myUserId,
        gameStates,
        joinGame,
        leaveGame,
        pickFighter,
        inProgressGameIds,
      }}
    >
      {children}
    </DemoDraftContext.Provider>
  );
};
