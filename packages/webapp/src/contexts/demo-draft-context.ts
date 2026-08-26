import type { DraftState } from "@challenger-fantasy/schemas";
import { createContext } from "react";

export interface DemoDraftContextType {
  username: string;
  setUsername: (name: string) => void;
  myUserId: string;
  /** gameStates[gameId] = undefined → not joined, null → connecting, DraftState → live */
  gameStates: Record<string, DraftState | null | undefined>;
  joinGame: (gameId: string, username: string) => void;
  leaveGame: (gameId: string) => void;
  pickFighter: (gameId: string, fighterId: string) => void;
  /** gameIds where draft is initializing or in-progress */
  inProgressGameIds: string[];
}

export const DemoDraftContext = createContext<DemoDraftContextType | null>(null);
