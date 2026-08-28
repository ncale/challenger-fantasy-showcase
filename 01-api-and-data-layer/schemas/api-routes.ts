import z from "zod";
import { emailSchema, otpSchema } from "./forms";
import { UsernameSchema } from "./user-settings";

// Search params schemas

export const eventTabsSearchSchema = z.object({
  tab: z.enum(["upcoming", "past"]).optional(),
});

export const sendOtpInputSchema = z.object({
  email: emailSchema,
  referralCode: z.string().optional(),
});

export const verifyOtpInputSchema = z.object({
  email: emailSchema,
  token: otpSchema,
});

export const setUsernameInputSchema = z.object({
  username: UsernameSchema,
});

export const joinSearchSchema = z.object({
  ref: z.string().optional(),
});
