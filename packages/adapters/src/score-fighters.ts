import { createScoringService } from "@challenger-fantasy/core";
import { lookupEventId, supabase } from "@challenger-fantasy/db";
import { type JobData, JobRole } from "@challenger-fantasy/ingest-queue";

/**
 * @role {@link JobRole.ORCHESTRATION}
 * @description Computes per-fighter scoring breakdowns for all completed fights in an event
 * and upserts them to fighter_scoring_archive. Triggers score-games when done.
 */
export async function scoreFighters(data: JobData): Promise<{
  rowsUpserted: number;
}> {
  const { eventExternalId } = data;
  if (typeof eventExternalId !== "string") throw new Error("eventExternalId required");

  const eventId = await lookupEventId(eventExternalId);

  const scoringService = createScoringService(supabase);
  return scoringService.scoreFightersForEvent(eventId);
}
