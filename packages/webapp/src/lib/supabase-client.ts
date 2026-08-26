import type { Database } from "@challenger-fantasy/types";
import { createClient } from "@supabase/supabase-js";
import { envClient } from "./env-client";

const browserClient = createClient<Database>(
  envClient.VITE_SUPABASE_URL,
  envClient.VITE_SUPABASE_ANON_KEY,
);

export function getSupabaseBrowserClient() {
  return browserClient;
}
