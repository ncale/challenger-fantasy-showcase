import type { FightResultMethod } from "../types";
import { z } from "@hono/zod-openapi";

const UFCSTATS_ID_LENGTH = 16;
function isUfcstatsId(id: string): boolean {
  const regex = new RegExp(`^[0-9a-f]{${UFCSTATS_ID_LENGTH}}$`, "i");
  return regex.test(id);
}

export const ufcstatsIdSchema = z.string().refine((id) => isUfcstatsId(id), {
  error: `Must be ${UFCSTATS_ID_LENGTH} characters long and alphanumeric lowercase.`,
});

export const parsePgInterval = (interval: unknown): number => {
  if (typeof interval !== "string") throw new Error(`Invalid interval: ${interval}`);
  const [hours, minutes, seconds] = interval.split(":");
  if (!hours || !minutes || !seconds) throw new Error(`Invalid interval: ${interval}`);
  return parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
};

// FIGHT RESULT METHOD HELPERS

export function isTko(method: FightResultMethod) {
  return method === "KO/TKO" || method === "TKO - Doctor's Stoppage";
}
export function isSubmission(method: FightResultMethod) {
  return method === "Submission";
}
export function isDecision(method: FightResultMethod) {
  return (
    method === "Decision - Split" ||
    method === "Decision - Unanimous" ||
    method === "Decision - Majority"
  );
}
export function isOverturned(method: FightResultMethod) {
  return method === "Overturned";
}
export function isDq(method: FightResultMethod) {
  return method === "DQ";
}
export function isCouldNotContinue(method: FightResultMethod) {
  return method === "Could Not Continue";
}
