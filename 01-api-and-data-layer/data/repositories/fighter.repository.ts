import type { DBClient } from "../../types";
import { mapFighter } from "../mappers/fighter.mapper";

class FighterRepository {
  private supabase: DBClient;
  constructor(supabase: DBClient) {
    this.supabase = supabase;
  }

  private async getBaseById(id: string) {
    const { data, error } = await this.supabase
      .schema("public")
      .from("fighter")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  private async getStatsById(id: string) {
    const { data, error } = await this.supabase
      .schema("public")
      .from("fighter_stats")
      .select("*")
      .eq("fighter_id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const [fighterData, fighterStatsData] = await Promise.all([
      this.getBaseById(id),
      this.getStatsById(id),
    ]);
    return mapFighter(fighterData, fighterStatsData);
  }
}

export function createFighterRepository(supabase: DBClient): FighterRepository {
  return new FighterRepository(supabase);
}

export type { FighterRepository };
