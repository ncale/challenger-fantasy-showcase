import {
  averageDecimalOdds,
  normalizeFighterName,
  noVigProbabilities,
  type OddsApiEvent,
} from "@challenger-fantasy/core";
import { getFightsWithFightersByEventIds, getNextUpcomingEventIds } from "@challenger-fantasy/db";
import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "@challenger-fantasy/ingest-queue";
import { enqueue } from "./utils.ts";

const redis = createRedisClient();

/**
 * @role {@link JobRole.ORCHESTRATION}
 * @description Matches Odds API events against upcoming DB fights by exact fighter name.
 *   Computes no-vig fair probabilities and enqueues an odds-snapshot-upsert per matched fighter.
 */
export async function oddsApiFanout(data: JobData): Promise<{ matched: number; skipped: number }> {
  const raw = await redis.get(RedisKeys.fetchOdds);
  if (!raw) throw new Error("No odds data in Redis — re-queue odds-api-fetch");

  const apiEvents = JSON.parse(raw) as OddsApiEvent[];

  const eventIds = await getNextUpcomingEventIds(10);
  const dbFights = await getFightsWithFightersByEventIds(eventIds);

  const queue = createQueue();
  let matched = 0;
  let skipped = 0;

  for (const apiEvent of apiEvents) {
    const { home_team, away_team, bookmakers } = apiEvent;

    const normHome = normalizeFighterName(home_team);
    const normAway = normalizeFighterName(away_team);

    const dbFight = dbFights.find(
      (f) =>
        (normalizeFighterName(f.fighter_1.full_name) === normHome &&
          normalizeFighterName(f.fighter_2.full_name) === normAway) ||
        (normalizeFighterName(f.fighter_1.full_name) === normAway &&
          normalizeFighterName(f.fighter_2.full_name) === normHome),
    );

    if (!dbFight) {
      skipped++;
      continue;
    }

    const homeOdds: number[] = [];
    const awayOdds: number[] = [];

    for (const bookmaker of bookmakers) {
      const h2h = bookmaker.markets.find((m) => m.key === "h2h");
      if (!h2h) continue;
      const homeOutcome = h2h.outcomes.find((o) => o.name === home_team);
      const awayOutcome = h2h.outcomes.find((o) => o.name === away_team);
      if (homeOutcome) homeOdds.push(homeOutcome.price);
      if (awayOutcome) awayOdds.push(awayOutcome.price);
    }

    if (!homeOdds.length || !awayOdds.length) {
      skipped++;
      continue;
    }

    const avgHome = averageDecimalOdds(homeOdds);
    const avgAway = averageDecimalOdds(awayOdds);
    const { fighter1: probHome, fighter2: probAway } = noVigProbabilities(avgHome, avgAway);

    const isF1Home = normalizeFighterName(dbFight.fighter_1.full_name) === normHome;
    const [f1, f2] = isF1Home
      ? [dbFight.fighter_1, dbFight.fighter_2]
      : [dbFight.fighter_2, dbFight.fighter_1];

    await Promise.all([
      enqueue(queue, "odds-snapshot-upsert", {
        fightId: dbFight.fight_id,
        fighterId: f1.id,
        avgDecimalOdds: avgHome.toNumber(),
        fairProbability: probHome.toNumber(),
        bookmakerCount: homeOdds.length,
        parentJobId: data.parentJobId,
      }),
      enqueue(queue, "odds-snapshot-upsert", {
        fightId: dbFight.fight_id,
        fighterId: f2.id,
        avgDecimalOdds: avgAway.toNumber(),
        fairProbability: probAway.toNumber(),
        bookmakerCount: awayOdds.length,
        parentJobId: data.parentJobId,
      }),
    ]);

    matched++;
  }

  return { matched, skipped };
}
