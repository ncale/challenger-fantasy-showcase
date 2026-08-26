import { useContext } from "react";
import { FighterScoringModalContext } from "~/contexts/fighter-scoring-modal-context";

export function useFighterScoringModal() {
  const ctx = useContext(FighterScoringModalContext);
  return (
    ctx ?? {
      openScoringBreakdown: (_fighterId: string, _fightId: string, _fighterName: string) => {},
    }
  );
}
