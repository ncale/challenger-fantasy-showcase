import { createContext } from "react";

interface FighterModalContextType {
  openFighter: (fighterId: string) => void;
}

export const FighterModalContext = createContext<FighterModalContextType | null>(null);
