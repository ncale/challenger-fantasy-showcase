import { statPointsBreakdownSchema } from "../../schemas";
import type { DBClient } from "../../types";

export class FighterScoringService {
  constructor(private supabase: DBClient) {}

  async getScoringByFightId(fighterId: string, fightId: string, scoringProfile: string) {
    const { data, error } = await this.supabase
      .schema("public")
      .from("fighter_scoring_archive")
      .select("*")
      .eq("fighter_id", fighterId)
      .eq("fight_id", fightId)
      .eq("scoring_profile", scoringProfile)
      .single();
    if (error) throw error;
    return {
      fighterId: data.fighter_id,
      score: data.score,
      breakdown: statPointsBreakdownSchema.parse(data.breakdown),
    };
  }
}

export function createFighterScoringService(supabase: DBClient) {
  return new FighterScoringService(supabase);
}
