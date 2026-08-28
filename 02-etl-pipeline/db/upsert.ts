import type {
  EventInsert,
  FighterAnalyticsInsert,
  FighterInsert,
  FighterStatsInsert,
  FightInsert,
  FightResultInsert,
  FightRoundSnapshotInsert,
  OddsSnapshotInsert,
} from "../schemas";
import { supabase } from "./client.ts";

export async function upsertEvent(row: EventInsert): Promise<void> {
  const { error } = await supabase
    .from("event")
    .upsert(row, { onConflict: "ufcstats_external_id" });
  if (error) throw error;
}

export async function upsertFighter(row: FighterInsert): Promise<void> {
  const { error } = await supabase
    .from("fighter")
    .upsert(row, { onConflict: "ufcstats_external_id" });
  if (error) throw error;
}

export async function upsertFighterStats(row: FighterStatsInsert): Promise<void> {
  const { error } = await supabase.from("fighter_stats").upsert(row, { onConflict: "fighter_id" });
  if (error) throw error;
}

export async function upsertFighterAnalytics(row: FighterAnalyticsInsert): Promise<void> {
  const { error } = await supabase
    .from("fighter_analytics")
    .upsert(row, { onConflict: "fighter_id" });
  if (error) throw error;
}

export async function upsertFight(row: FightInsert): Promise<void> {
  const { error } = await supabase
    .from("fight")
    .upsert(row, { onConflict: "ufcstats_external_id" });
  if (error) throw error;
}

export async function cancelFightsByExternalIds(ufcstatsExternalIds: string[]): Promise<number> {
  if (!ufcstatsExternalIds.length) return 0;
  const { data, error } = await supabase
    .from("fight")
    .update({ status: "cancelled", fight_order: null })
    .in("ufcstats_external_id", ufcstatsExternalIds)
    .select("id");
  if (error) throw error;
  return (data ?? []).length;
}

export async function upsertFightResult(row: FightResultInsert): Promise<void> {
  const { error } = await supabase.from("fight_result").upsert(row, { onConflict: "fight_id" });
  if (error) throw error;
}

export async function upsertFightRoundSnapshots(rows: FightRoundSnapshotInsert[]): Promise<void> {
  if (!rows.length) return;
  const { error } = await supabase
    .from("fight_round_snapshot")
    .upsert(rows, { onConflict: "fight_id,round" });
  if (error) throw error;
}

export async function insertOddsSnapshot(row: OddsSnapshotInsert): Promise<void> {
  const { error } = await supabase.from("odds_snapshot").insert(row);
  if (error) throw error;
}
