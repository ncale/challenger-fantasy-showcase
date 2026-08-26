import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useMemo } from "react";
import { DraftSessionContext } from "~/contexts/draft-session-context";
import { useDraftHaptics } from "~/hooks/use-draft-haptics";
import { useDraftRegistry } from "~/hooks/use-draft-registry";
import { useEventCard } from "~/hooks/use-event-card";
import { useSupabase } from "~/hooks/use-supabase";
import { getDraftStatusLabel } from "~/lib/draft-utils";
import { singleGameQuery, userProfileQuery } from "~/lib/init-queries";

export function DraftSessionProvider({ children }: { children: ReactNode }) {
  const { sessions, selectedDraftGroupId, pickFighter: registryPickFighter } = useDraftRegistry();
  const { userId } = useSupabase();

  const session = selectedDraftGroupId ? sessions[selectedDraftGroupId] : null;
  const draftState = session?.draftState ?? null;

  const { data: game } = useQuery(singleGameQuery(session?.gameId ?? undefined));
  const { fighters } = useEventCard(game?.eventId);

  const drafters = useMemo(() => {
    if (!draftState) return [];
    const users = Array.from(draftState.users);
    if (!("pickOrder" in draftState)) return users;
    const { pickOrder } = draftState;
    return [...users].sort((a, b) => {
      const aIdx = pickOrder.indexOf(a.userId);
      const bIdx = pickOrder.indexOf(b.userId);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
  }, [draftState]);

  const availableFighters = useMemo(
    () => fighters.filter((f) => !drafters.some((d) => d.picks.some((p) => p.fighterId === f.id))),
    [fighters, drafters],
  );

  const currentPickerId = draftState?.status === "in-progress" ? draftState.currentPickerId : "";
  const { data: currentPicker } = useQuery(userProfileQuery(currentPickerId));

  useDraftHaptics(draftState, userId);

  const pickFighter = useMemo(
    () => (fighterId: string) => {
      if (selectedDraftGroupId) registryPickFighter(selectedDraftGroupId, fighterId);
    },
    [selectedDraftGroupId, registryPickFighter],
  );

  const value = useMemo(
    () => ({
      draftState,
      game,
      drafters,
      availableFighters,
      pickFighter,
      currentPicker,
      draftStatusLabel: getDraftStatusLabel(draftState, userId),
    }),
    [draftState, game, drafters, availableFighters, pickFighter, currentPicker, userId],
  );

  return <DraftSessionContext.Provider value={value}>{children}</DraftSessionContext.Provider>;
}
