import { z } from "zod";

const errorMessage = (variable: string) => `${variable} is required in the server environment`;

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string({ error: errorMessage("VITE_SUPABASE_URL") }),
  VITE_SUPABASE_ANON_KEY: z.string({ error: errorMessage("VITE_SUPABASE_ANON_KEY") }),
  SUPABASE_SERVICE_KEY: z.string({ error: errorMessage("SUPABASE_SERVICE_KEY") }),
});

export const envServer = envSchema.parse({ ...process.env, ...import.meta.env });
