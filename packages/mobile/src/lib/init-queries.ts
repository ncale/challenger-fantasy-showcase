import {
  createHookFactory,
  createMutationFactory,
  createQueryFactory,
  createSupabaseQueryFactory,
} from "@challenger-fantasy/api-queries";
import { apiClient } from "./init-api";
import { supabase } from "./supabase";

const supabaseQueryFactory = createSupabaseQueryFactory(supabase);
const { userAccountQuery, checkUsernameQuery } = supabaseQueryFactory;

const queryFactory = createQueryFactory(apiClient);
const {
  userProfileQuery,
  userStatsQuery,
  userSubmissionCountsQuery,
  userSubmissionEventsQuery,
  userSubmissionEventsInfiniteQuery,
  eventsQuery,
  singleEventQuery,
  eventCardQuery,
  singleGameQuery,
  userSubmissionsQuery,
  userSubmissionsInfiniteQuery,
  singleSubmissionQuery,
  draftGroupQuery,
  singleFightQuery,
  preFightStatsQuery,
  singleFighterQuery,
  singleFighterAnalyticsQuery,
  fighterScoringQuery,
  featureFlagsQuery,
  appConfigQuery,
  pickRankingQuery,
} = queryFactory;

// Note: place mock queries here as needed while they're waiting to be implemented
// on the API side so the hooks can be used in the app without type errors.

const mutationFactory = createMutationFactory(apiClient);
const { deleteAccountMutation, updateSubmissionNameMutation, upsertPickRankingMutation } =
  mutationFactory;

const hookFactory = createHookFactory(queryFactory);
const { useUpcomingEventsWithCacheSeed, useEventCardWithCacheSeed } = hookFactory;

export {
  userAccountQuery,
  userProfileQuery,
  userStatsQuery,
  userSubmissionCountsQuery,
  userSubmissionEventsQuery,
  userSubmissionEventsInfiniteQuery,
  checkUsernameQuery,
  eventsQuery,
  singleEventQuery,
  eventCardQuery,
  singleGameQuery,
  userSubmissionsQuery,
  userSubmissionsInfiniteQuery,
  singleSubmissionQuery,
  draftGroupQuery,
  singleFightQuery,
  preFightStatsQuery,
  singleFighterQuery,
  singleFighterAnalyticsQuery,
  fighterScoringQuery,
  featureFlagsQuery,
  appConfigQuery,
  pickRankingQuery,
  deleteAccountMutation,
  updateSubmissionNameMutation,
  upsertPickRankingMutation,
  useUpcomingEventsWithCacheSeed,
  useEventCardWithCacheSeed,
};
