import { createContext } from "react";

interface FighterScoringModalContextType {
  openScoringBreakdown: (fighterId: string, fightId: string, fighterName: string) => void;
}

export const FighterScoringModalContext = createContext<FighterScoringModalContextType | null>(
  null,
);
