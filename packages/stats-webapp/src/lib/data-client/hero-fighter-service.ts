import type {
  Database,
  HeroFighterFightersBreakdownView,
  HeroFighterGameEntriesView,
  HeroFighterGameView,
} from "@challenger-fantasy/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class HeroFighterService {
  constructor(private supabase: SupabaseClient<Database>) {}

  public async getUpcomingGames(): Promise<HeroFighterGameView[]> {
    const { data, error } = await this.supabase
      .schema("api")
      .from("hero_fighter_game_view")
      .select("*")
      .order("event_date", { ascending: true })
      .eq("event_status", "scheduled")
      .limit(10);
    if (error) throw error;
    return data;
  }

  public async getGame(gameId: string): Promise<HeroFighterGameView> {
    const { data, error } = await this.supabase
      .schema("api")
      .from("hero_fighter_game_view")
      .select("*")
      .eq("id", gameId)
      .single();
    if (error) throw error;
    return data;
  }

  public async getFightersBreakdown(gameId: string): Promise<HeroFighterFightersBreakdownView[]> {
    const { data, error } = await this.supabase
      .schema("api")
      .from("hero_fighter_fighters_breakdown_view")
      .select("*")
      .eq("hero_fighter_game_id", gameId)
      .order("fight_order", { ascending: true });
    if (error) throw error;
    return data;
  }

  public async getGameEntries(gameId: string): Promise<HeroFighterGameEntriesView[]> {
    const { data, error } = await this.supabase
      .schema("api")
      .from("hero_fighter_game_entries_view")
      .select("*")
      .eq("hero_fighter_game_id", gameId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
}
