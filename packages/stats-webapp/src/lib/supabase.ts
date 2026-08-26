import type { Database } from "@challenger-fantasy/types";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabase = createClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
