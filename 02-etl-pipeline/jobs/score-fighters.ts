import { createScoringService } from "../data";
import { lookupEventId, supabase } from "../db";
import { type JobData, JobRole } from "../queue";

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
