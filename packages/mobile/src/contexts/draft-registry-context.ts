import type { DraftState } from "@challenger-fantasy/schemas";
import { createContext } from "react";

export interface DraftGroupSession {
  draftGroupId: string;
  gameId: string | null;
  draftState: DraftState | null;
}

export interface DraftRegistryContextType {
  sessions: Record<string, DraftGroupSession>;
  isDrafting: boolean;
  selectedDraftGroupId: string | null;
  selectDraft: (id: string | null) => void;
  joinDraft: (gameId: string) => boolean;
  leaveDraft: (draftGroupId: string) => void;
  pickFighter: (draftGroupId: string, fighterId: string) => void;
}

export const DraftRegistryContext = createContext<DraftRegistryContextType | null>(null);
