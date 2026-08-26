import type { FightResultMethod } from "@challenger-fantasy/types";
import { z } from "zod";

export const UnknownRecordSchema = z.record(z.string(), z.unknown());

export const FightResultMethodSchema = z.enum([
  "KO/TKO",
  "Could Not Continue",
  "Submission",
  "TKO - Doctor's Stoppage",
  "Overturned",
  "DQ",
  "Decision - Split",
  "Decision - Unanimous",
  "Decision - Majority",
]) satisfies z.ZodType<FightResultMethod>;
