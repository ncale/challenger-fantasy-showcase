import type {
  Database,
  FighterFights,
  FighterHeaderAndStats,
  FighterPast5YearStatsView,
} from "@challenger-fantasy/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class FighterPageService {
  constructor(private supabase: SupabaseClient<Database>) {}

  public async getHeaderAndStats(slug: string): Promise<FighterHeaderAndStats> {
    const { data, error } = await this.supabase
      .schema("api")
      .rpc("fighter_header_and_stats", { p_slug: slug })
      .single();
    if (error) throw error;
    return data;
  }

  public async getFights(slug: string, limit: number = 50): Promise<FighterFights> {
    const { data, error } = await this.supabase
      .schema("api")
      .rpc("fighter_fights", { p_slug: slug, p_limit: limit });
    if (error) throw error;
    return data;
  }

  public async getAggregatedStats(slug: string): Promise<FighterPast5YearStatsView> {
    const { data, error } = await this.supabase
      .schema("api")
      .from("fighter_past_5_year_stats_view")
      .select("*")
      .eq("fighter_slug", slug)
      .single();
    if (error) throw error;
    return data;
  }
}
