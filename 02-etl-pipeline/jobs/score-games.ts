import { createScoringService } from "../data";
import { getEventStatusByExternalId, lookupEventId, supabase } from "../db";
import { type JobData, JobRole } from "../queue";

/**
 * @role {@link JobRole.ORCHESTRATION}
 * @description Reads event status from DB. Scores all games for the event and writes results back to DB.
 */
export async function scoreGames(data: JobData): Promise<{
  gamesScored: number;
  submissionsScored: number;
}> {
  const { eventExternalId } = data;
  if (typeof eventExternalId !== "string") throw new Error("eventExternalId required");

  const [eventId, eventRecord] = await Promise.all([
    lookupEventId(eventExternalId),
    getEventStatusByExternalId(eventExternalId),
  ]);

  const scoringStatus =
    eventRecord?.status === "final" ? "final" : eventRecord?.status === "live" ? "live" : "pending";

  const scoringService = createScoringService(supabase);
  return scoringService.scoreGamesForEvent(eventId, scoringStatus);
}
