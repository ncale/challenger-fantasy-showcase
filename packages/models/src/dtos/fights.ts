import {
  type FightDto,
  FighterRoundStatsSchemaV1,
  type PreFightStatsDto,
} from "@challenger-fantasy/schemas";
import type { Database } from "@challenger-fantasy/types";
import type { HydratedFight } from "../models/fights";

export const mapFightToDto = (fight: HydratedFight): FightDto => {
  const status = fight.status;
  if (!status) {
    throw new Error(`Invalid data error. A fight status field is 'null' for ${fight.fight_id}.`);
  }

  const result = (() => {
    if (fight.status === "final") {
      if (!fight.result || !fight.result_round || !fight.result_round_time || !fight.method) {
        throw new Error(
          `Invalid data error. A fight result field is 'null' for ${fight.fight_id} where status is 'final'.`,
        );
      }

      return {
        result: fight.result,
        round: fight.result_round,
        round_time: fight.result_round_time,
        method: fight.method,
      } satisfies FightDto["result"];
    }
    return null;
  })();

  return {
    id: fight.fight_id,
    slug: fight.fight_slug,
    eventId: fight.event_id,
    fighter1: {
      id: fight.fighter_1_id,
      name: fight.fighter_1_name,
      slug: fight.fighter_1_slug,
      stats: fight.fighter_1_stats,
    },
    fighter2: {
      id: fight.fighter_2_id,
      name: fight.fighter_2_name,
      slug: fight.fighter_2_slug,
      stats: fight.fighter_2_stats,
    },
    status,
    order: fight.fight_order,
    weightClass: fight.weight_class,
    weightClassKey: fight.weight_class_key,
    result,
  } satisfies FightDto;
};

export const mapPreFightStatsToDto = (
  stats: Database["api"]["Views"]["fight_pre_fight_stats_view"]["Row"],
): PreFightStatsDto => {
  return {
    fightId: stats.id,
    fighter1: {
      id: stats.fighter_1_id,
      offensiveStats: FighterRoundStatsSchemaV1.parse(stats.fighter_1_offensive_stats),
      defensiveStats: FighterRoundStatsSchemaV1.parse(stats.fighter_1_defensive_stats),
      totalSeconds: stats.fighter_1_total_seconds,
      totalRounds: stats.fighter_1_total_rounds,
    },
    fighter2: {
      id: stats.fighter_2_id,
      offensiveStats: FighterRoundStatsSchemaV1.parse(stats.fighter_2_offensive_stats),
      defensiveStats: FighterRoundStatsSchemaV1.parse(stats.fighter_2_defensive_stats),
      totalSeconds: stats.fighter_2_total_seconds,
      totalRounds: stats.fighter_2_total_rounds,
    },
  };
};
