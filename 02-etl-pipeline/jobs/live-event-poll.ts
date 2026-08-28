import { getNextActiveEvent } from "../db";
import { createQueue, type JobData, JobRole } from "../queue";
import { enqueue } from "./utils.ts";

/**
 * @role {@link JobRole.ORCHESTRATION}
 * @description Polls for the current active event and triggers the fetch chain in live mode.
 * Lifecycle is driven by DB status: once an event is final, getNextActiveEvent naturally
 * returns the next scheduled event on the following poll.
 */
export async function liveEventPoll(_data: JobData): Promise<{
  skipped: boolean;
  reason?: string;
  eventStatus?: string;
}> {
  const next = await getNextActiveEvent();
  if (!next) return { skipped: true, reason: "no active or upcoming events in DB" };

  if (new Date(next.start_time).getTime() > Date.now()) {
    return { skipped: true, reason: "event has not started yet" };
  }

  const queue = createQueue();
  await enqueue(queue, "ufcstats-event-fetch", {
    externalId: next.ufcstats_external_id,
    liveMode: true,
  });

  return { skipped: false, eventStatus: next.status };
}
