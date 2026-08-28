export type FighterModel = {
  id: string;
  name: string;
  slug: string;
  dob: string | null;
  heightIn: number | null;
  reachIn: number | null;
  stance: string | null;
  country: string | null;
  wins: number;
  losses: number;
  draws: number;
  noContests: number;
};
