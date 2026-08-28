import { createQueue } from "../queue";

const queue = createQueue();

// Register recurring jobs. BullMQ deduplicates by jobId on restarts.
// BullMQ v5 uses `pattern` (cron syntax) inside `repeat`.
await queue.add(
  "ufcstats-events-upcoming-fetch",
  {},
  {
    repeat: { pattern: "0 9 * * *" }, // once daily at 9am UTC
    jobId: "ufcstats-events-upcoming-recurring",
  },
);

await queue.add(
  "add-default-games",
  {},
  {
    repeat: { pattern: "0 6 * * 0,2,4" }, // every Sunday, Tuesday, and Thursday at 6am UTC
    jobId: "add-default-games-recurring",
  },
);

await queue.add(
  "live-event-poll",
  {},
  {
    repeat: { pattern: "*/15 * * * *" },
    jobId: "live-event-poll-recurring",
  },
);

await queue.add(
  "odds-api-fetch",
  {},
  {
    repeat: { pattern: "0 */6 * * *" }, // 4x daily (every 6 hours)
    jobId: "odds-api-fetch-recurring",
  },
);
