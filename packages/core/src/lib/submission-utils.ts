import type { SubmissionDto } from "@challenger-fantasy/schemas";
import { SPECIAL_CHARS } from "@challenger-fantasy/shared";

type SubmissionSortStatus = "live" | "upcoming" | "completed";

export function sortSubmissions(
  submissions: SubmissionDto[],
  status: SubmissionSortStatus,
): SubmissionDto[] {
  const sorted = [...submissions];
  if (status === "completed") {
    sorted.sort((a, b) => {
      const aPos = a.scoring.position ?? 0;
      const bPos = b.scoring.position ?? 0;
      if (aPos > 0 && bPos > 0) return aPos - bPos;
      if (aPos > 0) return -1;
      if (bPos > 0) return 1;
      return (b.scoring.score ?? 0) - (a.scoring.score ?? 0);
    });
  } else if (status === "live") {
    sorted.sort((a, b) => (b.scoring.score ?? 0) - (a.scoring.score ?? 0));
  }
  return sorted;
}

const MAX_NAMES = 4;

export function createSubmissionName(lastNames: string[]): string {
  return lastNames.slice(0, MAX_NAMES).join(` ${SPECIAL_CHARS.INTERPUNCT} `);
}
