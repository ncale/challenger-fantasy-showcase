export const RedisKeys = {
  finishedFights: (externalId: string) => `live:finished-fights:${externalId}`,
  fetchEventsUpcoming: "fetch:events-upcoming",
  fetchEvent: (externalId: string) => `fetch:event:${externalId}`,
  fetchFight: (externalId: string) => `fetch:fight:${externalId}`,
  fetchFighter: (externalId: string) => `fetch:fighter:${externalId}`,
  parsedEventsUpcoming: "parsed:events-upcoming",
  parsedEvent: (externalId: string) => `parsed:event:${externalId}`,
  parsedFight: (externalId: string) => `parsed:fight:${externalId}`,
  parsedFighter: (externalId: string) => `parsed:fighter:${externalId}`,
  fetchOdds: "fetch:odds-api-mma",
} as const;
