import { z } from "zod";

// USER SETTINGS AND CONFIG

const RESERVED_USERNAMES = [
  "admin",
  "support",
  "help",
  "null",
  "undefined",
  "moderator",
  "system",
  "bot",
  "official",
];

export const UsernameSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/,
    "Username can only contain letters, numbers, underscores, and hyphens, and must start with a letter or number",
  )
  .min(3, { message: "Username must be at least 3 characters" })
  .max(20, { message: "Username must be at most 20 characters" })
  .refine((val) => !RESERVED_USERNAMES.includes(val.toLowerCase()), "That username is reserved");
export const isUsernameValid = (username: string) => UsernameSchema.safeParse(username).success;
