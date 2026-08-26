import { z } from "zod/mini";

const errorMessage = (variable: string) => `${variable} is required in the client environment`;

const envSchema = z.object({
  // vite defaults
  MODE: z.unknown(),
  BASE_URL: z.string(),
  DEV: z.boolean(),
  PROD: z.boolean(),
  SSR: z.boolean(),
  // custom
  VITE_APP_NAME: z.string({ error: errorMessage("VITE_APP_NAME") }),
  VITE_SUPABASE_URL: z.string({ error: errorMessage("VITE_SUPABASE_URL") }),
  VITE_SUPABASE_ANON_KEY: z.string({ error: errorMessage("VITE_SUPABASE_ANON_KEY") }),
  VITE_API_URL: z.string({ error: errorMessage("VITE_API_URL") }),
});

export const envClient = envSchema.parse(import.meta.env);
