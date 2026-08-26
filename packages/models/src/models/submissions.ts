import {
  type DailyMmaGameSubmissionBreakdown,
  type DailyMmaGameSubmissionMetadata,
  DailyMmaGameSubmissionMetadataSchema,
  dailyMmaGameSubmissionBreakdownSchema,
} from "@challenger-fantasy/schemas";
import type { Database, Json, Overwrite, Prettify } from "@challenger-fantasy/types";

// SUBMISSIONS - Hydrated parses submission metadata and breakdown

// GENERIC

type BaseSubmission = {
  submission_metadata: Json;
  breakdown: Json | null; // TODO: check - can these breakdowns be null?
};

type HydratedGenericSubmission<T extends BaseSubmission> = Prettify<
  Overwrite<
    T,
    {
      submission_metadata: DailyMmaGameSubmissionMetadata;
      breakdown: DailyMmaGameSubmissionBreakdown | null;
    }
  >
>;

function hydrateGenericSubmission<T extends BaseSubmission>(
  submission: T,
): HydratedGenericSubmission<T> {
  return {
    ...submission,
    submission_metadata: DailyMmaGameSubmissionMetadataSchema.parse(submission.submission_metadata),
    breakdown: dailyMmaGameSubmissionBreakdownSchema.nullable().parse(submission.breakdown),
  };
}

// NON-GENERIC

// TODO: I need to update this VIEW to have submission picks and rankings, so there is only a single model
// for each submission pick

type DailyMmaGameSubmissionsView =
  Database["api"]["Views"]["daily_mma_game_submissions_view"]["Row"];

export type HydratedSubmission = HydratedGenericSubmission<DailyMmaGameSubmissionsView>;

export function hydrateSubmission(submission: DailyMmaGameSubmissionsView): HydratedSubmission {
  return hydrateGenericSubmission(submission);
}
