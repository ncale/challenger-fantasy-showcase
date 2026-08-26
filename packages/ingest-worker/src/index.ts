import {
  addDefaultGames,
  calculateFighterAnalytics,
  liveEventPoll,
  oddsApiFanout,
  oddsApiFetch,
  oddsSnapshotUpsert,
  scoreFighters,
  scoreGames,
  ufcstatsCancelOrphanFights,
  ufcstatsEventFanout,
  ufcstatsEventFetch,
  ufcstatsEventParse,
  ufcstatsEventsUpcomingFanout,
  ufcstatsEventsUpcomingFetch,
  ufcstatsEventsUpcomingParse,
  ufcstatsEventUpsert,
  ufcstatsFighterFetch,
  ufcstatsFighterParse,
  ufcstatsFighterStatsUpsert,
  ufcstatsFighterUpsert,
  ufcstatsFightFanout,
  ufcstatsFightFetch,
  ufcstatsFightParse,
  ufcstatsFightResultUpsert,
  ufcstatsFightUpsert,
} from "@challenger-fantasy/adapters";
import { getLastSeenPerSource } from "@challenger-fantasy/db";
import { createWorker } from "@challenger-fantasy/ingest-queue";
import * as Sentry from "@sentry/bun";

Sentry.init({
  dsn: "https://59763d38147298b983bd1e895a8f9a9b@o4511214875312128.ingest.us.sentry.io/4511233491337216",
  sendDefaultPii: true,
});

const worker = createWorker(async (job) => {
  const start = Date.now();
  try {
    let result: Record<string, unknown> | undefined;
    const jobName = job.name;
    switch (jobName) {
      case "ufcstats-events-upcoming-fetch":
        result = await ufcstatsEventsUpcomingFetch(job.data);
        break;
      case "ufcstats-events-upcoming-parse":
        result = await ufcstatsEventsUpcomingParse(job.data);
        break;
      case "ufcstats-events-upcoming-fanout":
        result = await ufcstatsEventsUpcomingFanout(job.data);
        break;
      case "ufcstats-event-fetch":
        result = await ufcstatsEventFetch(job.data);
        break;
      case "ufcstats-event-parse":
        result = await ufcstatsEventParse(job.data);
        break;
      case "ufcstats-event-upsert":
        result = await ufcstatsEventUpsert(job.data);
        break;
      case "ufcstats-event-fanout":
        result = await ufcstatsEventFanout(job.data);
        break;
      case "ufcstats-cancel-orphan-fights":
        result = await ufcstatsCancelOrphanFights(job.data);
        break;
      case "ufcstats-fight-fetch":
        result = await ufcstatsFightFetch(job.data);
        break;
      case "ufcstats-fight-parse":
        result = await ufcstatsFightParse(job.data);
        break;
      case "ufcstats-fight-upsert":
        result = await ufcstatsFightUpsert(job.data);
        break;
      case "ufcstats-fight-fanout":
        result = await ufcstatsFightFanout(job.data);
        break;
      case "ufcstats-fight-result-upsert":
        result = await ufcstatsFightResultUpsert(job.data);
        break;
      case "ufcstats-fighter-fetch":
        result = await ufcstatsFighterFetch(job.data);
        break;
      case "ufcstats-fighter-parse":
        result = await ufcstatsFighterParse(job.data);
        break;
      case "ufcstats-fighter-upsert":
        result = await ufcstatsFighterUpsert(job.data);
        break;
      case "ufcstats-fighter-stats-upsert":
        result = await ufcstatsFighterStatsUpsert(job.data);
        break;
      case "calculate-fighter-analytics":
        result = await calculateFighterAnalytics(job.data);
        break;
      case "add-default-games":
        result = await addDefaultGames(job.data);
        break;
      case "live-event-poll":
        result = await liveEventPoll(job.data);
        break;
      case "score-fighters":
        result = await scoreFighters(job.data);
        break;
      case "score-games":
        result = await scoreGames(job.data);
        break;
      case "staleness-check":
        await runStalenessCheck();
        break;
      case "odds-api-fetch":
        result = await oddsApiFetch(job.data);
        break;
      case "odds-api-fanout":
        result = await oddsApiFanout(job.data);
        break;
      case "odds-snapshot-upsert":
        result = await oddsSnapshotUpsert(job.data);
        break;
      default: {
        const exhaustiveCheck: never = jobName;
        if (exhaustiveCheck) throw new Error(`Unknown job name ${job.name}`);
      }
    }
    console.log({ ms: Date.now() - start, ...result }, "ok");
    await job.log(JSON.stringify(result));
  } catch (err) {
    console.error({ err, ms: Date.now() - start }, "failed");
    Sentry.captureException(err);
    throw err; // re-throw so BullMQ retries
  }
});

worker.on("ready", () => console.info("ingest-worker connected, waiting for jobs"));
worker.on("error", (err) => console.error({ err }, "ingest-worker error"));

async function runStalenessCheck() {
  const rows = await getLastSeenPerSource();
  for (const row of rows) {
    if (!row.last_seen) continue;
    const hoursAgo = (Date.now() - new Date(row.last_seen).getTime()) / 3_600_000;
    if (hoursAgo > 24) {
      console.warn({ source: row.source, hoursAgo: Math.round(hoursAgo) }, "stale data source");
      await notifySlack(`[ingest] ${row.source} stale — last seen ${Math.round(hoursAgo)}h ago`);
    }
  }
}

async function notifySlack(text: string) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}
