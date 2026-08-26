import type { Drafter, DraftState, GameDto, UserProfileDto } from "@challenger-fantasy/schemas";
import { createContext } from "react";
import type { EventCardFighter } from "~/hooks/use-event-card";

export interface DraftSessionContextType {
  draftState: DraftState | null;
  game: GameDto | undefined;
  drafters: Drafter[];
  availableFighters: EventCardFighter[];
  pickFighter: (fighterId: string) => void;
  currentPicker: UserProfileDto | undefined;
  draftStatusLabel: string | null;
}

export const DraftSessionContext = createContext<DraftSessionContextType | null>(null);
