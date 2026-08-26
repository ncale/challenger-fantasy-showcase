import type { DraftState, FighterSimpleDto } from "@challenger-fantasy/schemas";
import type { UserProfile } from "@challenger-fantasy/types";
import { createContext } from "react";

interface DraftContextType {
  joinGameLobby: (gameId: string) => void;
  draftState: DraftState | null;
  availableFighters: FighterSimpleDto[];
  pickFighter: (fighterId: string) => void;
  currentPicker: UserProfile | undefined;
}

export const DraftContext = createContext<DraftContextType | null>(null);
