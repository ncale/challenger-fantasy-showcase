import {
  FighterRoundStatsSchemaV1,
  type FighterRoundStatsV1,
  FightResultMethodSchema,
  parsePgInterval,
} from "@challenger-fantasy/schemas";
import type {
  Database,
  FightResultMethod,
  Json,
  Overwrite,
  Prettify,
} from "@challenger-fantasy/types";

// FIGHT STATS - Hydrated parses fight stats. Null if fight is not completed yet.

// GENERIC

type BaseFight = {
  fighter_1_stats: Json | null;
  fighter_2_stats: Json | null;
  method: string | null;
  result_round_time: unknown | null;
};

type HydratedGenericFight<T extends BaseFight> = Prettify<
  Overwrite<
    T,
    {
      fighter_1_stats: FighterRoundStatsV1 | null;
      fighter_2_stats: FighterRoundStatsV1 | null;
      method: FightResultMethod | null;
      result_round_time: number | null;
    }
  >
>;

function hydrateGenericFight<T extends BaseFight>(fight: T): HydratedGenericFight<T> {
  return {
    ...fight,
    fighter_1_stats: FighterRoundStatsSchemaV1.nullable().parse(fight.fighter_1_stats),
    fighter_2_stats: FighterRoundStatsSchemaV1.nullable().parse(fight.fighter_2_stats),
    method: FightResultMethodSchema.nullable().parse(fight.method),
    result_round_time: fight.result_round_time ? parsePgInterval(fight.result_round_time) : null,
  };
}

// NON-GENERIC

type EventFightsView = Database["api"]["Views"]["event_fights_view"]["Row"];

export type HydratedFight = HydratedGenericFight<EventFightsView>;

export function hydrateFight(fight: EventFightsView): HydratedFight {
  return hydrateGenericFight(fight);
}

// OTHER / HELPER FUNCTIONS

// FIGHT STATS BY FIGHTER ID - Hydrated parses fighter fight stats

export type FightStatsByFighterId = {
  off: FighterRoundStatsV1 | null;
  def: FighterRoundStatsV1 | null;
  winner: boolean | null;
  method: FightResultMethod | null;
  resultRound: number | null;
  resultTime: number | null;
};

export function makeFightStatsByFighterId(
  fighterId: string,
  eventFight: HydratedFight,
): FightStatsByFighterId {
  if (fighterId !== eventFight.fighter_1_id && fighterId !== eventFight.fighter_2_id) {
    throw new Error("Fighter ID does not match fight fighter IDs");
  }

  const isFighter1 = fighterId === eventFight.fighter_1_id;

  const [off, def] = isFighter1
    ? [eventFight.fighter_1_stats, eventFight.fighter_2_stats]
    : [eventFight.fighter_2_stats, eventFight.fighter_1_stats];

  const winner = eventFight.result === (isFighter1 ? "f1" : "f2");

  const method = eventFight.method;
  const resultRound = eventFight.result_round;
  const resultTime = eventFight.result_round_time;

  return { off, def, winner, method, resultRound, resultTime };
}
