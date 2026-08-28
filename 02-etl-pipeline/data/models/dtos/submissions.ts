import {
  DailyMmaGameSubmissionPickMetadataSchema,
  gameConfigSchema,
  gameMetadataSchema,
  type SubmissionDetailDto,
  type SubmissionDto,
} from "../../../schemas";
import type { DailyMmaGameSubmissionPicksView } from "../../../types";
import { getGameName } from "../helpers";
import type { HydratedSubmission } from "../models/submissions";

// TODO: remove the concept of "Hydrated" entities. We're already mapping to DTOs for the api.

export const mapSubmissionToDto = (submission: HydratedSubmission): SubmissionDto => {
  const gameConfig = gameConfigSchema.parse(submission.game_config);
  const gameMetadata = gameMetadataSchema.parse(submission.game_metadata);
  const gameName = getGameName(gameConfig, gameMetadata);

  if (!submission.event_slug)
    throw new Error("event_slug is required for mapping to SubmissionDto");
  if (!submission.event_status)
    throw new Error("event_status is required for mapping to SubmissionDto");
  if (!submission.start_time)
    throw new Error("start_time is required for mapping to SubmissionDto");
  if (!submission.prelims_start_time)
    throw new Error("prelims_start_time is required for mapping to SubmissionDto");
  if (!submission.main_card_start_time)
    throw new Error("main_card_start_time is required for mapping to SubmissionDto");

  return {
    id: submission.id,
    name: submission.submission_metadata.name,
    scoring: {
      // TODO: fix - these defaults should not be applied here
      score: submission.score ?? 0,
      position: submission.position ?? 0,
    },
    game: {
      id: submission.game_id,
      name: gameName,
    },
    event: {
      id: submission.event_id,
      name: submission.event_name,
      shortName: submission.event_short_name ?? undefined,
    },
  };
};

export const mapSubmissionToDetailDto = (
  submission: HydratedSubmission,
  picks: DailyMmaGameSubmissionPicksView[],
): SubmissionDetailDto => {
  const gameConfig = gameConfigSchema.parse(submission.game_config);
  const gameMetadata = gameMetadataSchema.parse(submission.game_metadata);

  const mappedPicks = picks.map((pick) => {
    const pickMetadata = DailyMmaGameSubmissionPickMetadataSchema.parse(pick.pick_metadata);
    return {
      fighterId: pick.fighter_id,
      kind: pickMetadata.kind,
      order: pickMetadata.order,
    };
  }) satisfies SubmissionDetailDto["picks"];

  return {
    id: submission.id,
    name: submission.submission_metadata.name,
    draftGroupId: submission.draft_group_id,
    game: {
      id: submission.game_id,
      name: getGameName(gameConfig, gameMetadata),
    },
    event: {
      id: submission.event_id,
      name: submission.event_name,
    },
    picks: mappedPicks,
    scoring: {
      // TODO: fix - these defaults should not be applied here
      score: submission.score ?? 0,
      position: submission.position ?? 0,
    },
  };
};
