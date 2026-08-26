import {
  createHookFactory,
  createQueryFactory,
  createSupabaseQueryFactory,
} from "@challenger-fantasy/api-queries";
import { apiClient } from "./init-api";
import { getSupabaseBrowserClient } from "./supabase-client";

const supabaseQueryFactory = createSupabaseQueryFactory(getSupabaseBrowserClient());
const { userAccountQuery, checkUsernameQuery } = supabaseQueryFactory;

const queryFactory = createQueryFactory(apiClient);
const {
  userProfileQuery,
  eventsQuery,
  singleEventQuery,
  eventCardQuery,
  singleGameQuery,
  userSubmissionsQuery,
  singleSubmissionQuery,
  singleFightQuery,
  preFightStatsQuery,
  singleFighterQuery,
  singleFighterSimpleQuery,
  singleFighterAggregatedStatsQuery,
} = queryFactory;

const hookFactory = createHookFactory(queryFactory);
const { useUpcomingEventsWithCacheSeed, useEventCardWithCacheSeed } = hookFactory;

export {
  userAccountQuery,
  userProfileQuery,
  checkUsernameQuery,
  eventsQuery,
  singleEventQuery,
  eventCardQuery,
  singleGameQuery,
  userSubmissionsQuery,
  singleSubmissionQuery,
  singleFightQuery,
  preFightStatsQuery,
  singleFighterQuery,
  singleFighterSimpleQuery,
  singleFighterAggregatedStatsQuery,
  useUpcomingEventsWithCacheSeed,
  useEventCardWithCacheSeed,
};
