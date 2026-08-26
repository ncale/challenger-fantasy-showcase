import { z } from "zod";
import { mobileLogger } from "./logger";

const errorMessage = (variable: string) => `${variable} is required in the environment`;

const toWebSocketUrl = (url: string) =>
  url.replace(/^https?/, (protocol) => (protocol === "https" ? "wss" : "ws"));

const envSchema = z
  .object({
    EXPO_PUBLIC_SUPABASE_URL: z
      .url({
        error: errorMessage("EXPO_PUBLIC_SUPABASE_URL"),
      })
      .transform((val) => val.replace(/\/+$/, "")),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: z
      .string({ error: errorMessage("EXPO_PUBLIC_SUPABASE_ANON_KEY") })
      .min(46, {
        error: "EXPO_PUBLIC_SUPABASE_ANON_KEY must be at least 46 characters",
      }),
    EXPO_PUBLIC_POSTHOG_URL: z
      .url({ error: errorMessage("EXPO_PUBLIC_POSTHOG_URL") })
      .transform((val) => val.replace(/\/+$/, ""))
      .optional(),
    EXPO_PUBLIC_POSTHOG_KEY: z
      .string({ error: errorMessage("EXPO_PUBLIC_POSTHOG_KEY") })
      .optional(),
    EXPO_PUBLIC_API_URL: z
      .url({ error: errorMessage("EXPO_PUBLIC_API_URL") })
      .transform((val) => val.replace(/\/+$/, "")),
    EXPO_PUBLIC_ENABLE_DEMO: z.stringbool().optional(),
    EXPO_PUBLIC_REVIEWER_PASSWORD: z.string().optional(),
  })
  .transform((env) => ({
    ...env,
    EXPO_PUBLIC_API_WEBSOCKET_URL: toWebSocketUrl(env.EXPO_PUBLIC_API_URL),
  }));

// ! Note: If you add new environment variables, they must be explicitly used
// ! with dot notation in order to be included in the bundle by Expo.
// ! See https://docs.expo.dev/guides/environment-variables/#how-to-read-from-environment-variables
export const env = envSchema.parse({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_POSTHOG_URL: process.env.EXPO_PUBLIC_POSTHOG_URL,
  EXPO_PUBLIC_POSTHOG_KEY: process.env.EXPO_PUBLIC_POSTHOG_KEY,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_ENABLE_DEMO: process.env.EXPO_PUBLIC_ENABLE_DEMO,
  EXPO_PUBLIC_REVIEWER_PASSWORD: process.env.EXPO_PUBLIC_REVIEWER_PASSWORD,
});

mobileLogger.lifecycle.info({ env }, "env.loaded");
