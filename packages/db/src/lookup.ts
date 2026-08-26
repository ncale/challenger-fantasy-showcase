import { supabase } from "./client.ts";

export async function getLastSeenPerSource(): Promise<{ source: string; last_seen: Date }[]> {
  const [events, fighters, fights] = await Promise.all([
    supabase.from("event").select("updated_at").order("updated_at", { ascending: false }).limit(1),
    supabase
      .from("fighter")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1),
    supabase.from("fight").select("updated_at").order("updated_at", { ascending: false }).limit(1),
  ]);

  return [
    { source: "event", last_seen: new Date(events.data?.[0]?.updated_at ?? 0) },
    { source: "fighter", last_seen: new Date(fighters.data?.[0]?.updated_at ?? 0) },
    { source: "fight", last_seen: new Date(fights.data?.[0]?.updated_at ?? 0) },
  ];
}

export async function getNextUpcomingEventIds(limit: number): Promise<string[]> {
  const { data, error } = await supabase
    .from("event")
    .select("id")
    .eq("status", "scheduled")
    // Use event_date for ordering instead of start_time since it is more reliably populated for upcoming events.
    // It is also roughly accurate enough for the purpose of sorting.
    .order("event_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((e) => e.id);
}

export async function getScheduledEventExternalIds(): Promise<string[]> {
  const { data, error } = await supabase
    .schema("public")
    .from("event")
    .select("ufcstats_external_id")
    .eq("status", "scheduled");
  if (error) throw error;
  return (data ?? []).map((e) => e.ufcstats_external_id).filter((id): id is string => id !== null);
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export async function getStaleLiveEventExternalIds(): Promise<string[]> {
  const { data, error } = await supabase
    .schema("public")
    .from("event")
    .select("ufcstats_external_id")
    .eq("status", "live")
    .lte("start_time", new Date(Date.now() - ONE_DAY_MS).toISOString());
  if (error) throw error;
  return (data ?? []).map((e) => e.ufcstats_external_id).filter((id): id is string => id !== null);
}

export async function getFighterLastUpdated(externalId: string): Promise<Date | null> {
  const { data } = await supabase
    .schema("public")
    .from("fighter")
    .select("updated_at")
    .eq("ufcstats_external_id", externalId)
    .single();

  return data?.updated_at ? new Date(data.updated_at) : null;
}

export async function getNextActiveEvent() {
  const { data, error } = await supabase
    .from("event")
    .select("id, ufcstats_external_id, start_time, status")
    .in("status", ["live", "scheduled"])
    .not("ufcstats_external_id", "is", null)
    .order("start_time", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data?.ufcstats_external_id || !data.start_time) return null;
  return {
    id: data.id,
    ufcstats_external_id: data.ufcstats_external_id,
    start_time: data.start_time,
    status: data.status,
  };
}

export async function getNextScheduledEvent() {
  const { data, error } = await supabase
    .from("event")
    .select("id, ufcstats_external_id, start_time")
    .eq("status", "scheduled")
    .not("ufcstats_external_id", "is", null)
    .order("start_time", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data?.ufcstats_external_id || !data.start_time) return null;
  return {
    id: data.id,
    ufcstats_external_id: data.ufcstats_external_id,
    start_time: data.start_time,
  };
}

export async function getEventStatusByExternalId(
  externalId: string,
): Promise<{ id: string; status: string } | null> {
  const { data } = await supabase
    .from("event")
    .select("id, status")
    .eq("ufcstats_external_id", externalId)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, status: data.status };
}

export async function lookupEventId(ufcstatsExternalId: string): Promise<string> {
  const { data, error } = await supabase
    .from("event")
    .select("id")
    .eq("ufcstats_external_id", ufcstatsExternalId)
    .single();
  if (error) throw new Error(`Event not in production yet: ${ufcstatsExternalId} — will retry`);
  return data.id;
}

export async function lookupFighterId(ufcstatsExternalId: string): Promise<string> {
  const { data, error } = await supabase
    .from("fighter")
    .select("id")
    .eq("ufcstats_external_id", ufcstatsExternalId)
    .single();
  if (error) throw new Error(`Fighter not in production yet: ${ufcstatsExternalId} — will retry`);
  return data.id;
}

// TODO: This function should go into `core/repositories` and map to a domain model
export async function getFighterRecentFightsWithResults(fighterId: string, lookbackYears: number) {
  const since = new Date();
  since.setFullYear(since.getFullYear() - lookbackYears);
  const sinceIso = since.toISOString().slice(0, 10);

  const { data: events, error: eventsError } = await supabase
    .from("event")
    .select("id")
    .gte("event_date", sinceIso);
  if (eventsError) throw eventsError;

  const eventIds = (events ?? []).map((e) => e.id);
  if (!eventIds.length) return [];

  const { data, error } = await supabase
    .from("fight")
    .select(
      "id, fighter_1_id, fighter_2_id, weight_class_key, fight_result!inner(round, round_time, fighter_1_stats, fighter_2_stats)",
    )
    .in("event_id", eventIds)
    .or(`fighter_1_id.eq.${fighterId},fighter_2_id.eq.${fighterId}`)
    .eq("status", "final");
  if (error) throw error;

  return data ?? [];
}

export async function getFightExternalIdsByEventId(eventId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("fight")
    .select("ufcstats_external_id")
    .eq("event_id", eventId)
    .neq("status", "cancelled");
  if (error) throw error;
  return (data ?? []).map((f) => f.ufcstats_external_id).filter((id): id is string => id !== null);
}

export async function lookupFightId(ufcstatsExternalId: string): Promise<string> {
  const { data, error } = await supabase
    .from("fight")
    .select("id")
    .eq("ufcstats_external_id", ufcstatsExternalId)
    .single();
  if (error) throw new Error(`Fight not in production yet: ${ufcstatsExternalId} — will retry`);
  return data.id;
}

export async function getFightsWithFightersByEventIds(eventIds: string[]): Promise<
  Array<{
    fight_id: string;
    fighter_1: { id: string; full_name: string | null };
    fighter_2: { id: string; full_name: string | null };
  }>
> {
  if (!eventIds.length) return [];

  const { data: fights, error: fightError } = await supabase
    .from("fight")
    .select("id, fighter_1_id, fighter_2_id")
    .in("event_id", eventIds)
    .eq("status", "scheduled");
  if (fightError) throw fightError;
  if (!fights?.length) return [];

  const fighterIds = [...new Set(fights.flatMap((f) => [f.fighter_1_id, f.fighter_2_id]))];

  const { data: fighters, error: fighterError } = await supabase
    .from("fighter")
    .select("id, full_name")
    .in("id", fighterIds);
  if (fighterError) throw fighterError;

  const fighterMap = new Map((fighters ?? []).map((f) => [f.id, f]));

  return fights.map((fight) => ({
    fight_id: fight.id,
    fighter_1: {
      id: fight.fighter_1_id,
      full_name: fighterMap.get(fight.fighter_1_id)?.full_name ?? null,
    },
    fighter_2: {
      id: fight.fighter_2_id,
      full_name: fighterMap.get(fight.fighter_2_id)?.full_name ?? null,
    },
  }));
}
