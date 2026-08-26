import type { Database } from "@challenger-fantasy/types";
import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { envServer } from "./env-server";

/**
 * Should be initialized for every action the user needs to perform on the DB
 * ! It's highly recommended to configure RLS policies on Supabase, so the user can only read, create, edit and delete only their own data
 */
export function getSupabaseServerClient() {
  return createServerClient<Database>(
    envServer.VITE_SUPABASE_URL,
    envServer.VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            setCookie(cookie.name, cookie.value, { ...cookie.options });
          });
        },
      },
      auth: {
        flowType: "pkce",
        autoRefreshToken: true,
        persistSession: true,
      },
    },
  );
}
