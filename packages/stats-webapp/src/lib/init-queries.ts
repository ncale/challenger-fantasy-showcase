import { createQueryFactory } from "@challenger-fantasy/api-queries";
import { apiClient } from "./init-api";

const queryFactory = createQueryFactory(apiClient);

export const {
  eventsQuery,
  singleEventQuery,
  eventCardQuery,
  singleFightQuery,
  preFightStatsQuery,
  fightersQuery,
  singleFighterQuery,
  singleFighterAggregatedStatsQuery,
} = queryFactory;
