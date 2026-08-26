import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSupabase } from "~/hooks/use-supabase";
import { pickRankingQuery, upsertPickRankingMutation } from "~/lib/init-queries";

type PickRankingContextValue = {
  rankedIds: string[];
  isDirty: boolean;
  isSaving: boolean;
  isAdded: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  reorder: (newIds: string[]) => void;
  save: () => void;
  reset: () => void;
};

const PickRankingContext = createContext<PickRankingContextValue | null>(null);

type Props = {
  eventId: string | undefined;
  allFighterIds: string[];
  children: React.ReactNode;
};

export function PickRankingProvider({ eventId, allFighterIds, children }: Props) {
  const { session } = useSupabase();
  const accessToken = session?.access_token ?? "";
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const { data: savedRanking, isPending: isRankingPending } = useQuery(
    pickRankingQuery(userId, eventId, accessToken),
  );

  const [rankedIds, setRankedIds] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (allFighterIds.length === 0) return;
    if (isRankingPending) return;
    const savedIds = savedRanking?.fighterIds ?? [];
    const validIds = savedIds.filter((id) => allFighterIds.includes(id));
    setRankedIds(validIds);
    initialized.current = true;
  }, [savedRanking, allFighterIds, isRankingPending]);

  const { mutate: saveMutate, isPending: isSaving } = useMutation({
    ...upsertPickRankingMutation(accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "pick-ranking", eventId] });
      setIsDirty(false);
    },
  });

  const isAdded = useCallback((id: string) => rankedIds.includes(id), [rankedIds]);

  const add = useCallback(
    (id: string) => {
      if (rankedIds.includes(id) || rankedIds.length >= 12) return;
      setRankedIds((prev) => [...prev, id]);
      setIsDirty(true);
    },
    [rankedIds],
  );

  const remove = useCallback((id: string) => {
    setRankedIds((prev) => prev.filter((r) => r !== id));
    setIsDirty(true);
  }, []);

  const reorder = useCallback((newIds: string[]) => {
    setRankedIds(newIds);
    setIsDirty(true);
  }, []);

  const save = useCallback(() => {
    if (!eventId) return;
    saveMutate({ eventId, fighterIds: rankedIds });
  }, [eventId, saveMutate, rankedIds]);

  const reset = useCallback(() => {
    setRankedIds([]);
    setIsDirty(true);
  }, []);

  return (
    <PickRankingContext.Provider
      value={{ rankedIds, isDirty, isSaving, isAdded, add, remove, reorder, save, reset }}
    >
      {children}
    </PickRankingContext.Provider>
  );
}

export function usePickRankingContext() {
  const ctx = useContext(PickRankingContext);
  if (!ctx) throw new Error("usePickRankingContext must be used within PickRankingProvider");
  return ctx;
}
