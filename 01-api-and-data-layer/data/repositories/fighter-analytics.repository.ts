import type { DBClient } from "../../types";
import { mapFighterAnalytics } from "../mappers/fighter-analytics.mapper";

class FighterAnalyticsRepository {
  private supabase: DBClient;
  constructor(supabase: DBClient) {
    this.supabase = supabase;
  }

  async getAnalyticsById(id: string) {
    const { data, error } = await this.supabase
      .schema("public")
      .from("fighter_analytics")
      .select("*")
      .eq("fighter_id", id)
      .single();
    if (error) throw error;
    return mapFighterAnalytics(data);
  }

  async getAnalyticsByIds(ids: string[]) {
    const { data, error } = await this.supabase
      .schema("public")
      .from("fighter_analytics")
      .select("*")
      .in("fighter_id", ids);
    if (error) throw error;
    return data.map(mapFighterAnalytics);
  }

  async getStatsById(id: string) {
    const { data, error } = await this.supabase
      .schema("public")
      .from("fighter_stats")
      .select("*")
      .eq("fighter_id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}

export function createFighterAnalyticsRepository(supabase: DBClient): FighterAnalyticsRepository {
  return new FighterAnalyticsRepository(supabase);
}

export type { FighterAnalyticsRepository };
