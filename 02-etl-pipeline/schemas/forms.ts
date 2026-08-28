import type { Slot } from "../types";
import { z } from "zod";

// Login

export const emailSchema = z.string({ message: "Invalid email address" });
export const otpSchema = z
  .string()
  .min(6, { message: "Invalid OTP" })
  .max(6, { message: "Invalid OTP" })
  .regex(/^\d{6}$/, { message: "Invalid OTP" });

// Drafts

const slotSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("default"),
    fighterId: z.string(),
  }),
  z.strictObject({
    kind: z.literal("backup"),
    fighterId: z.string().optional(),
  }),
]) satisfies z.ZodType<Slot>;

export const createSlotsSchema = (length: number) => {
  return z.array(slotSchema).length(length);
};

export const SubmissionNameSchema = z
  .string()
  .min(1, { message: "Submission name is required" })
  .max(40, { message: "Submission name too long" });
