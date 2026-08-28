const BASE_URL = "https://api.the-odds-api.com/v4";

type OddsApiOutcome = {
  name: string;
  price: number;
};

type OddsApiMarket = {
  key: string;
  last_update: string;
  outcomes: OddsApiOutcome[];
};

type OddsApiBookmaker = {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
};

export type OddsApiEvent = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
};

export async function fetchMmaOdds(apiKey: string): Promise<OddsApiEvent[]> {
  const url = new URL(`${BASE_URL}/sports/mma_mixed_martial_arts/odds`);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", "us");
  url.searchParams.set("markets", "h2h");
  url.searchParams.set("dateFormat", "iso");
  url.searchParams.set("oddsFormat", "decimal");
  url.searchParams.set("includeLinks", "false");
  url.searchParams.set("includeSids", "false");
  url.searchParams.set("includeBetLimits", "false");
  url.searchParams.set("includeRotationNumbers", "false");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Odds API HTTP ${res.status}: ${await res.text()}`);
  return res.json() as Promise<OddsApiEvent[]>;
}
