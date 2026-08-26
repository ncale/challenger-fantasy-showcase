import { isNullish } from "@challenger-fantasy/core";
import { Redirect } from "expo-router";
import { useSupabase } from "~/hooks/use-supabase";

export default function Index() {
  const { session, profile, isProfileLoading } = useSupabase();
  if (isNullish(session)) return <Redirect href="/(public)" />;
  if (isProfileLoading) return <Redirect href="/loading" />;
  if (isNullish(profile?.username)) return <Redirect href="/set-username" />;
  return <Redirect href="/(protected)" />;
}
