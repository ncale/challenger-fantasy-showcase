import type {
  Database,
  FightHeader,
  FightPreFightStatsView,
  FightStatsView,
} from "@challenger-fantasy/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class FightPageService {
  constructor(private supabase: SupabaseClient<Database>) {}

  private async getHeader(id: string): Promise<FightHeader> {
    const { data, error } = await this.supabase
      .schema("api")
      .rpc("fight_header", { p_fight_id: id })
      .single();
    if (error) throw error;
    return data;
  }

  public async getPage(id: string) {
    const header = await this.getHeader(id);
    return { header };
  }

  public async getFightStats(id: string): Promise<FightStatsView> {
    const { data, error } = await this.supabase
      .schema("api")
      .from("fight_stats_view")
      .select("*")
      .eq("fight_id", id)
      .single();
    if (error) throw error;
    return data;
  }

  public async getPreFightStats(fightId: string): Promise<FightPreFightStatsView> {
    const { data, error } = await this.supabase
      .schema("api")
      .from("fight_pre_fight_stats_view")
      .select("*")
      .eq("id", fightId)
      .single();
    if (error) throw error;
    return data;
  }
}
