import type { Database, DBClient } from "@challenger-fantasy/types";
import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient(env: Env): DBClient {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch },
  });
}
