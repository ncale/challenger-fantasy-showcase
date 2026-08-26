import type { SubmissionStatusOptions } from "@challenger-fantasy/types";

export const SUBMISSION_STATUS_MAP = {
  live: "live",
  upcoming: "scheduled",
  completed: "final",
} as const satisfies Record<SubmissionStatusOptions["status"], string>;

export type DbSubmissionStatus = (typeof SUBMISSION_STATUS_MAP)[keyof typeof SUBMISSION_STATUS_MAP];
