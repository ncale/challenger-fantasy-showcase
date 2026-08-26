import type { Database, FighterModel } from "@challenger-fantasy/types";

type Fighter = Database["public"]["Tables"]["fighter"]["Row"];
type FighterStats = Database["public"]["Tables"]["fighter_stats"]["Row"];

export const mapFighter = (fighterRow: Fighter, fighterStatsRow: FighterStats): FighterModel => ({
  id: fighterRow.id,
  name: fighterRow.full_name,
  slug: fighterRow.slug,
  dob: fighterRow.dob,
  heightIn: fighterRow.height_in,
  reachIn: fighterRow.reach_in,
  stance: fighterRow.stance,
  country: fighterRow.country,
  wins: fighterStatsRow.wins,
  losses: fighterStatsRow.losses,
  draws: fighterStatsRow.draws,
  noContests: fighterStatsRow.no_contests,
});
