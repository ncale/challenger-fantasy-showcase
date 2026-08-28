import { getGameName } from "../models";
import {
  DailyMmaGameSubmissionMetadataSchema,
  gameConfigSchema,
  gameMetadataSchema,
} from "../../schemas";
import type { Database, UserSubmissionModel } from "../../types";

type ViewRow = Database["api"]["Views"]["daily_mma_game_submissions_view"]["Row"];

export const mapUserSubmission = (row: ViewRow): UserSubmissionModel => {
  if (!row.id) throw new Error("submission id is required");
  if (!row.game_id) throw new Error("game_id is required");
  if (!row.event_id) throw new Error("event_id is required");
  if (!row.event_name) throw new Error("event_name is required");
  if (!row.event_slug) throw new Error("event_slug is required");
  if (!row.event_status) throw new Error("event_status is required");
  if (!row.event_date) throw new Error("event_date is required");
  if (!row.start_time) throw new Error("start_time is required");

  const metadata = DailyMmaGameSubmissionMetadataSchema.parse(row.submission_metadata);
  const gameConfig = gameConfigSchema.parse(row.game_config);
  const gameMeta = gameMetadataSchema.parse(row.game_metadata);

  return {
    id: row.id,
    name: metadata.name ?? null,
    scoring: {
      score: row.score ?? 0,
      position: row.position ?? null,
    },
    game: {
      id: row.game_id,
      name: getGameName(gameConfig, gameMeta),
    },
    event: {
      id: row.event_id,
      name: row.event_name,
      shortName: row.event_short_name ?? null,
      slug: row.event_slug,
      status: row.event_status,
      date: row.event_date,
      startTimeUtc: row.start_time,
    },
  };
};
