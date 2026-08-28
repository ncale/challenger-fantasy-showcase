import type { DateParsed, LocationParsed, WeightClassParsed, WinnerString } from "../../common.ts";

////////////////////////////////////////////////////////////

type Fighter = {
  externalId: string; // fighter id from the href
  name: string;
};

type BaseFight = {
  externalId: string; // fight id from the href
  fighter1: Fighter;
  fighter2: Fighter;
  weightClass: WeightClassParsed;
};

type Fight = BaseFight & {
  winner: WinnerString | null;
};
// &
// BonusInfo & {
//   result: FightResult; // fight result (if completed)
//   isTitleFight: boolean;
// };

type EventResult = {
  name: string;
  eventDate: DateParsed;
  location: LocationParsed | null;
  fights: Fight[];
};

////////////////////////////////////////////////////////////

// FINAL RESULT TYPE

export type { EventResult as EventParseResult };

// EXPORTS

export type { Fight as FightParsed, Fighter as FighterParsed };
