import { type ConnectionOptions, type Processor, Queue, Worker } from "bullmq";
import Redis from "ioredis";

export { RedisKeys } from "./redis-keys.ts";

export const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export const QUEUE_NAME = "ingest-jobs";

/**
 * Enforced roles to prevent scope creep.
 * Use these in @role docblocks in adapter files.
 */
export enum JobRole {
  ACQUISITION = "ACQUISITION", // Fetch HTML, save to Redis, trigger a parse job
  TRANSFORMATION = "TRANSFORMATION", // Parse HTML from Redis, transform to structured data, trigger an upsert job
  PERSISTENCE = "PERSISTENCE", // Read parsed data from Redis, upsert to DB; DATABASE I/O only
  ORCHESTRATION = "ORCHESTRATION", // Read from DB, calculate derivatives, write back to DB or trigger other jobs
  MAINTENANCE = "MAINTENANCE", // Staleness checks, cleanup, cache invalidation, etc
}

export type JobName =
  | "ufcstats-events-upcoming-fetch"
  | "ufcstats-events-upcoming-parse"
  | "ufcstats-events-upcoming-fanout"
  | "ufcstats-event-fetch"
  | "ufcstats-event-parse"
  | "ufcstats-event-upsert"
  | "ufcstats-event-fanout"
  | "ufcstats-cancel-orphan-fights"
  | "ufcstats-fight-fetch"
  | "ufcstats-fight-parse"
  | "ufcstats-fight-upsert"
  | "ufcstats-fight-fanout"
  | "ufcstats-fight-result-upsert"
  | "ufcstats-fighter-fetch"
  | "ufcstats-fighter-parse"
  | "ufcstats-fighter-upsert"
  | "ufcstats-fighter-stats-upsert"
  | "calculate-fighter-analytics"
  | "staleness-check"
  | "add-default-games"
  | "live-event-poll"
  | "score-fighters"
  | "score-games"
  | "odds-api-fetch"
  | "odds-api-fanout"
  | "odds-snapshot-upsert";

export type JobData = {
  url?: string;
  externalId?: string;
  parentJobId?: string;
  liveMode?: boolean;
  [key: string]: unknown;
};

export function createQueue() {
  return new Queue<JobData, void, JobName>(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 8,
      backoff: { type: "exponential", delay: 5000 },
    },
  });
}

export function createWorker(handler: Processor<JobData, void, JobName>, concurrency = 1) {
  return new Worker<JobData, void, JobName>(QUEUE_NAME, handler, {
    connection,
    concurrency,
    limiter: { max: 1, duration: 2000 },
  });
}

export function createRedisClient() {
  return new Redis({
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
    maxRetriesPerRequest: null, // Required for BullMQ compatibility
  });
}
