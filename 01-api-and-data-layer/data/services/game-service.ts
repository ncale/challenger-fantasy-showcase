import type { GameConfigV1, GameMetadataV1 } from "../../schemas";
import type { DBClient, Json, Overwrite } from "../../types";
import { v5 as uuidv5 } from "uuid";
import { z } from "zod";

// Fixed namespace for deterministic game IDs — do not change, it would invalidate all existing IDs
const GAME_NAMESPACE = "12c6e459-72cf-4f29-a98e-a6ad7b119863";

class GameService {
  constructor(private supabase: DBClient) {}

  private createDefault = {
    draftConfigV1: ({
      people,
      pickSlots,
      opensAt,
    }: {
      people: 2 | 3 | 4;
      pickSlots: number;
      opensAt: Date | undefined;
    }): Json => {
      // * This type ensures the game config fits our schema while the `Json` return type
      // * ensures it can be serialized and stored in the database without issues.
      return {
        version: 1,
        scope: { kind: "single_event" },
        mode: { kind: "draft", numPeople: people, pickClockSeconds: 90 },
        numPickSlots: pickSlots,
        selectFrom: { kind: "full_card" },
        scoringProfile: "balanced",
        ...(opensAt && { submissionWindow: { opens_at: opensAt.toISOString() } }),
      } satisfies Overwrite<GameConfigV1, { submissionWindow?: { opens_at: string } }>;
    },
    metadataV1: (): Json => {
      return {
        version: 1,
        enabled: true,
      } satisfies GameMetadataV1;
    },
  };

  public async addDefaultGames(eventId: string) {
    z.uuid().parse(eventId);

    const { data: event, error: eventError } = await this.supabase
      .schema("public")
      .from("event")
      .select("event_date")
      .eq("id", eventId)
      .single();
    if (eventError) throw new Error(`Could not fetch event: ${eventError.message}`);

    const opensAt = event.event_date
      ? new Date(new Date(event.event_date).getTime() - 8 * 24 * 60 * 60 * 1000)
      : undefined;

    const games = (
      [
        { defaultGameVariant: "draft-2p", people: 2, pickSlots: 4 },
        { defaultGameVariant: "draft-3p", people: 3, pickSlots: 4 },
        { defaultGameVariant: "draft-4p", people: 4, pickSlots: 3 },
      ] as const
    ).map(({ defaultGameVariant, people, pickSlots }) => ({
      id: uuidv5(`${eventId}:${defaultGameVariant}`, GAME_NAMESPACE),
      event_id: eventId,
      config: this.createDefault.draftConfigV1({ people, pickSlots, opensAt }),
      metadata: this.createDefault.metadataV1(),
    }));

    await this.supabase.schema("public").from("daily_mma_game").upsert(games, { onConflict: "id" });
  }
}

export function createGameService(supabase: DBClient): GameService {
  return new GameService(supabase);
}

export type { GameService };
