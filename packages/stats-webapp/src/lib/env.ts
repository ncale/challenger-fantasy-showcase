import { z } from "zod";

const envSchema = z.object({
  // vite default env
  PROD: z.boolean(),
  DEV: z.boolean(),
  // configured build vars
  VITE_SUPABASE_PROJ_ID: z.string(),
  VITE_SUPABASE_URL: z.string(),
  VITE_SUPABASE_ANON_KEY: z.string(),
  VITE_API_URL: z.string(),
  VITE_PUBLIC_POSTHOG_KEY: z.string(),
  VITE_PUBLIC_POSTHOG_HOST: z.string(),
});

export const env = envSchema.parse(import.meta.env);
