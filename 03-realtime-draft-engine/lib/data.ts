import { createDataClient } from "../data";
import { getSupabaseClient } from "./supabase";

export function getDataClient(env: Env) {
  return createDataClient(getSupabaseClient(env));
}
