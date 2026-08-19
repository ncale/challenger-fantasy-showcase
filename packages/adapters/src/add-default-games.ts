import { createGameService } from "@challenger-fantasy/core";
import { getNextUpcomingEventIds, supabase } from "@challenger-fantasy/db";
import { type JobData, JobRole } from "@challenger-fantasy/ingest-queue";

/**
 * @role {@link JobRole.ORCHESTRATION}
 * @description Reads upcoming event IDs from DB. Creates default games for each upcoming event.
 */
export async function addDefaultGames(_data: JobData): Promise<{ eventIds: string[] }> {
  const eventIds = await getNextUpcomingEventIds(3);

  console.info({ eventIds }, "Adding default games for upcoming events");

  const gameService = createGameService(supabase);
  for (const eventId of eventIds) {
    await gameService.addDefaultGames(eventId);
  }

  return { eventIds };
}
