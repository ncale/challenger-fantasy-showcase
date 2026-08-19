import { hash } from "@challenger-fantasy/core";
import type {
  BustCacheOptions,
  DBClient,
  EventCardOptions,
  EventListOptions,
  InfinitePaginationOptions,
  PagePaginationOptions,
  SubmissionStatusOptions,
} from "@challenger-fantasy/types";
import { isNullish } from "@challenger-fantasy/utils";
import type { createApiClient } from "@challenger-fantasy/worker/api-client";
import { infiniteQueryOptions, mutationOptions, queryOptions } from "@tanstack/react-query";

// TODO: pass error message through to raised error
// TODO: createSupabaseQueryFactory should, eventually, merge into one query factory, where every query flows through the api

export const createSupabaseQueryFactory = (supabase: DBClient) => {
  return {
    // USERS
    userAccountQuery: (id: string) =>
      queryOptions({
        queryKey: ["users", id, "config"],
        queryFn: async () => {
          const { data, error } = await supabase
            .schema("api")
            .from("user_account_view")
            .select("*")
            .eq("user_id", id)
            .single();
          if (!data || error) throw new Error("Failed to fetch user account:", error);

          return data;
        },
      }),
    checkUsernameQuery: (username: string) =>
      queryOptions({
        queryKey: ["check-username", username],
        queryFn: async () => {
          const { data, error } = await supabase
            .schema("public")
            .from("user_profile")
            .select("*")
            .ilike("username", username)
            .single();
          if (error) {
            if (error.code === "PGRST116") {
              return { isAvailable: true }; // No rows returned
            }
            throw error; // Throw any other errors
          }
          return {
            isAvailable: data.username?.toLowerCase() !== username.toLowerCase(),
          };
        },
        enabled: username.trim().length > 0,
      }),
  };
};

export const createMutationFactory = (apiClient: ReturnType<typeof createApiClient>) => {
  return {
    // USERS
    deleteAccountMutation: (bearerToken: string) =>
      mutationOptions({
        mutationKey: ["users", "delete", hash(bearerToken).slice(0, 8)], // include hash of token for uniqueness without exposing it
        mutationFn: async () => {
          const res = await apiClient.v1.users.me.$delete(
            {},
            { headers: { authorization: `Bearer ${bearerToken}` } },
          );
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error((body as { message?: string }).message ?? "Failed to delete account");
          }
        },
      }),

    // PICK RANKINGS
    upsertPickRankingMutation: (bearerToken: string) =>
      mutationOptions({
        mutationKey: ["pick-ranking", "upsert", hash(bearerToken).slice(0, 8)],
        mutationFn: async ({ eventId, fighterIds }: { eventId: string; fighterIds: string[] }) => {
          const res = await apiClient.v1.users.me["pick-ranking"].$put(
            { json: { eventId, fighterIds } },
            { headers: { authorization: `Bearer ${bearerToken}` } },
          );
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error((body as { message?: string }).message ?? "Failed to upsert ranking");
          }
          return res.json();
        },
      }),

    // SUBMISSIONS
    updateSubmissionNameMutation: (bearerToken: string) =>
      mutationOptions({
        mutationKey: ["submissions", "update-name", hash(bearerToken).slice(0, 8)],
        mutationFn: async ({
          submissionId,
          name,
        }: {
          submissionId: string;
          name: string | null;
        }) => {
          const res = await apiClient.v1.submissions[":id"].name.$patch(
            { param: { id: submissionId }, json: { name } },
            { headers: { authorization: `Bearer ${bearerToken}` } },
          );
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error((body as { message?: string }).message ?? "Failed to update name");
          }
        },
      }),
  };
};

export const createQueryFactory = (apiClient: ReturnType<typeof createApiClient>) => {
  return {
    // USERS
    userProfileQuery: (id: string) =>
      queryOptions({
        queryKey: ["users", id, "profile"],
        queryFn: async () => {
          if (isNullish(id)) throw new Error("User ID is required");
          const res = await apiClient.v1.users[":id"].profile.$get({ param: { id } });
          if (!res.ok) throw new Error("Failed to fetch profile");
          return res.json();
        },
        enabled: Boolean(id) && id.trim().length > 0,
      }),
    userStatsQuery: (id: string | undefined) =>
      queryOptions({
        queryKey: ["users", id, "stats"],
        queryFn: async () => {
          if (isNullish(id)) throw new Error("User ID is required");
          const res = await apiClient.v1.users[":id"].stats.$get({ param: { id } });
          if (!res.ok) throw new Error("Failed to fetch user stats");
          return res.json();
        },
        enabled: Boolean(id) && (id?.trim().length ?? 0) > 0,
      }),
    userSubmissionCountsQuery: (
      userId: string | undefined,
      { bustCache = false }: BustCacheOptions = {},
    ) =>
      queryOptions({
        queryKey: ["users", userId, "submission-counts"],
        queryFn: async () => {
          if (isNullish(userId)) throw new Error("userId is required");
          const res = await apiClient.v1.users[":id"]["submission-counts"].$get({
            param: { id: userId },
            query: { timestamp: bustCache ? Date.now().toString() : undefined },
          });
          if (!res.ok) throw new Error("Failed to fetch submission counts");
          return res.json();
        },
        enabled: Boolean(userId),
      }),
    userSubmissionsQuery: (
      userId: string | undefined,
      {
        status = "upcoming",
        page = 0,
        pageSize = 20,
        bustCache = false,
      }: SubmissionStatusOptions & PagePaginationOptions & BustCacheOptions = {
        status: "upcoming",
      },
    ) =>
      queryOptions({
        queryKey: ["users", userId, "submissions", { status, page, pageSize, bustCache }],
        queryFn: async () => {
          if (isNullish(userId)) throw new Error("userId is required");
          const res = await apiClient.v1.users[":id"].submissions.$get({
            param: { id: userId },
            query: {
              status,
              page,
              pageSize,
              timestamp: bustCache ? Date.now().toString() : undefined,
            },
          });
          if (!res.ok) throw new Error("Failed to fetch active submissions");
          return res.json();
        },
        enabled: Boolean(userId),
      }),
    userSubmissionEventsQuery: (
      userId: string | undefined,
      {
        status = "completed",
        page = 0,
        pageSize = 20,
      }: { status?: SubmissionStatusOptions["status"] } & PagePaginationOptions = {},
    ) =>
      queryOptions({
        queryKey: ["users", userId, "submission-events", { status, page, pageSize }],
        queryFn: async () => {
          if (isNullish(userId)) throw new Error("userId is required");
          const res = await apiClient.v1.users[":id"]["submission-events"].$get({
            param: { id: userId },
            query: { status, page, pageSize },
          });
          if (!res.ok) throw new Error("Failed to fetch submission events");
          return res.json();
        },
        enabled: Boolean(userId),
      }),
    userSubmissionEventsInfiniteQuery: (
      userId: string | undefined,
      {
        status = "completed",
        pageSize = 20,
      }: { status?: SubmissionStatusOptions["status"] } & InfinitePaginationOptions = {},
    ) =>
      infiniteQueryOptions({
        queryKey: ["users", userId, "submission-events", "infinite", { status, pageSize }],
        queryFn: async ({ pageParam }) => {
          if (isNullish(userId)) throw new Error("userId is required");
          const res = await apiClient.v1.users[":id"]["submission-events"].$get({
            param: { id: userId },
            query: { status, page: pageParam, pageSize },
          });
          if (!res.ok) throw new Error("Failed to fetch submission events");
          return res.json();
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
          if (lastPage.submissionEvents.length < pageSize) return undefined;
          return lastPageParam + 1;
        },
        enabled: Boolean(userId),
      }),
    userSubmissionsGroupedQuery: (
      userId: string | undefined,
      {
        status = "upcoming",
        page = 0,
        pageSize = 20,
        bustCache = false,
      }: SubmissionStatusOptions & PagePaginationOptions & BustCacheOptions = {
        status: "upcoming",
      },
    ) =>
      queryOptions({
        queryKey: [
          "users",
          userId,
          "submissions",
          "grouped",
          { status, page, pageSize, bustCache },
        ],
        queryFn: async () => {
          if (isNullish(userId)) throw new Error("userId is required");
          const res = await apiClient.v1.users[":id"].submissions.grouped.$get({
            param: { id: userId },
            query: {
              status,
              page,
              pageSize,
              timestamp: bustCache ? Date.now().toString() : undefined,
            },
          });
          if (!res.ok) throw new Error("Failed to fetch grouped submissions");
          return res.json();
        },
        enabled: Boolean(userId),
      }),
    userSubmissionsInfiniteQuery: (
      userId: string | undefined,
      {
        status = "upcoming",
        pageSize = 20,
        bustCache = false,
      }: SubmissionStatusOptions & InfinitePaginationOptions & BustCacheOptions = {
        status: "upcoming",
      },
    ) =>
      infiniteQueryOptions({
        queryKey: ["users", userId, "submissions", "infinite", { status, pageSize, bustCache }],
        queryFn: async ({ pageParam }) => {
          if (isNullish(userId)) throw new Error("userId is required");
          const res = await apiClient.v1.users[":id"].submissions.$get({
            param: { id: userId },
            query: {
              status,
              page: pageParam,
              pageSize,
              timestamp: bustCache ? Date.now().toString() : undefined,
            },
          });
          if (!res.ok) throw new Error("Failed to fetch submissions");
          return res.json();
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
          if (lastPage.submissions.length < pageSize) return undefined;
          return lastPageParam + 1;
        },
        enabled: Boolean(userId),
      }),
    // PICK RANKINGS
    pickRankingQuery: (
      userId: string | undefined,
      eventId: string | undefined,
      bearerToken: string,
    ) =>
      queryOptions({
        queryKey: ["users", userId, "pick-ranking", eventId],
        queryFn: async () => {
          if (isNullish(eventId)) throw new Error("eventId is required");
          const res = await apiClient.v1.users.me["pick-ranking"].$get(
            { query: { eventId } },
            { headers: { authorization: `Bearer ${bearerToken}` } },
          );
          if (!res.ok) throw new Error("Failed to fetch pick ranking");
          return res.json();
        },
        enabled: Boolean(userId) && Boolean(eventId) && Boolean(bearerToken),
        staleTime: 60_000,
      }),
    // EVENTS
    eventsQuery: (options?: EventListOptions & PagePaginationOptions & BustCacheOptions) =>
      queryOptions({
        queryKey: ["events", "list", options],
        queryFn: async () => {
          const res = await apiClient.v1.events.$get({
            query: {
              status: options?.status,
              page: options?.page?.toString(),
              pageSize: options?.pageSize?.toString(),
              timestamp: options?.bustCache ? Date.now().toString() : undefined,
            },
          });
          if (!res.ok) throw new Error("Failed to fetch events");
          return res.json();
        },
      }),
    singleEventQuery: (idOrSlug: string | undefined) =>
      queryOptions({
        queryKey: ["events", idOrSlug],
        queryFn: async () => {
          if (isNullish(idOrSlug)) throw new Error("idOrSlug is required");

          const res = await apiClient.v1.events[":idOrSlug"].$get({
            param: { idOrSlug },
          });
          if (!res.ok) throw new Error("Failed to fetch event");

          const data = await res.json();
          return data;
        },
        enabled: Boolean(idOrSlug),
      }),
    eventCardQuery: (
      idOrSlug: string | undefined,
      { top, bustCache = false }: EventCardOptions & BustCacheOptions = {},
    ) =>
      queryOptions({
        queryKey: ["events", idOrSlug, "card"],
        queryFn: async () => {
          if (isNullish(idOrSlug)) throw new Error("idOrSlug is required");

          const res = await apiClient.v1.events[":idOrSlug"].card.$get({
            param: { idOrSlug },
            query: {
              top: top,
              timestamp: bustCache ? Date.now().toString() : undefined,
            },
          });
          if (!res.ok) throw new Error("Failed to fetch event card");

          const data = await res.json();
          return data;
        },
        enabled: Boolean(idOrSlug),
      }),
    // GAMES
    singleGameQuery: (id: string | undefined, { bustCache = false }: BustCacheOptions = {}) =>
      queryOptions({
        queryKey: ["games", id],
        queryFn: async () => {
          if (isNullish(id)) throw new Error("id is required");
          const res = await apiClient.v1.games[":id"].$get({
            param: { id },
            query: { timestamp: bustCache ? Date.now().toString() : undefined },
          });
          if (!res.ok) throw new Error("Failed to fetch game");
          return res.json();
        },
        enabled: Boolean(id),
      }),

    // DRAFT GROUP
    draftGroupQuery: (
      submissionId: string | undefined,
      { bustCache = false }: BustCacheOptions = {},
    ) =>
      queryOptions({
        queryKey: ["submissions", submissionId, "draft-group"],
        queryFn: async () => {
          if (isNullish(submissionId)) throw new Error("submissionId is required");
          const res = await apiClient.v1.submissions[":id"]["draft-group"].$get({
            param: { id: submissionId },
            query: { timestamp: bustCache ? Date.now().toString() : undefined },
          });
          if (!res.ok) throw new Error("Failed to fetch draft group");
          return res.json();
        },
        enabled: Boolean(submissionId),
      }),

    // SUBMISSIONS
    singleSubmissionQuery: (
      submissionId: string | undefined,
      { bustCache = false }: BustCacheOptions = {},
    ) =>
      queryOptions({
        queryKey: ["submissions", submissionId],
        queryFn: async () => {
          if (isNullish(submissionId)) throw new Error("submissionId is required");
          const res = await apiClient.v1.submissions[":id"].$get({
            param: { id: submissionId },
            query: { timestamp: bustCache ? Date.now().toString() : undefined },
          });
          if (!res.ok) throw new Error("Failed to fetch submission");
          return res.json();
        },
        enabled: Boolean(submissionId),
      }),

    // FIGHTS
    singleFightQuery: (idOrSlug: string | undefined) =>
      queryOptions({
        queryKey: ["fights", idOrSlug],
        queryFn: async () => {
          if (isNullish(idOrSlug)) throw new Error("idOrSlug is required");

          const res = await apiClient.v1.fights[":idOrSlug"].$get({
            param: { idOrSlug },
          });
          if (!res.ok) throw new Error("Failed to fetch fight");

          const data = await res.json();
          return data;
        },
        enabled: Boolean(idOrSlug),
      }),
    preFightStatsQuery: (idOrSlug: string | undefined) =>
      queryOptions({
        queryKey: ["fights", idOrSlug, "pre-fight-stats"],
        queryFn: async () => {
          if (isNullish(idOrSlug)) throw new Error("idOrSlug is required");

          const res = await apiClient.v1.fights[":idOrSlug"]["pre-fight-stats"].$get({
            param: { idOrSlug },
          });
          if (!res.ok) throw new Error("Failed to fetch fight");

          const data = await res.json();
          return data;
        },
        enabled: Boolean(idOrSlug),
      }),
    // FIGHTERS
    fightersQuery: (options?: { kind: "popular" }) =>
      queryOptions({
        queryKey: ["fighters", "list", options],
        queryFn: async () => {
          const res = await apiClient.v1.fighters.$get({
            query: { kind: options?.kind ?? "popular" },
          });
          if (!res.ok)
            throw new Error(
              `Failed to fetch fighters ${res.status}: ${JSON.stringify(await res.text())}`,
            );
          return res.json();
        },
      }),
    singleFighterQuery: (idOrSlug: string | undefined) =>
      queryOptions({
        queryKey: ["fighters", idOrSlug],
        queryFn: async () => {
          if (isNullish(idOrSlug)) throw new Error("idOrSlug is required");

          const res = await apiClient.v1.fighters[":idOrSlug"].$get({
            param: { idOrSlug },
          });
          if (!res.ok) throw new Error("Failed to fetch fighter");

          const fighter = await res.json();
          return fighter;
        },
        enabled: Boolean(idOrSlug),
      }),
    /** @deprecated use `singleFighterQuery` instead */
    singleFighterSimpleQuery: (idOrSlug: string | undefined) =>
      queryOptions({
        queryKey: ["fighters", idOrSlug, "simple"],
        queryFn: async () => {
          if (isNullish(idOrSlug)) throw new Error("idOrSlug is required");
          const res = await apiClient.v1.fighters[":idOrSlug"].simple.$get({
            param: { idOrSlug },
          });
          if (!res.ok) throw new Error("Failed to fetch fighter");
          return res.json();
        },
        enabled: Boolean(idOrSlug),
      }),
    singleFighterAnalyticsQuery: (idOrSlug: string | undefined) =>
      queryOptions({
        queryKey: ["fighters", idOrSlug, "analytics"],
        queryFn: async () => {
          if (isNullish(idOrSlug)) throw new Error("idOrSlug is required");

          const res = await apiClient.v1.fighters[":idOrSlug"].analytics.$get({
            param: { idOrSlug },
          });
          if (!res.ok) throw new Error("Failed to fetch fighter");

          const fighter = await res.json();
          return fighter;
        },
        enabled: Boolean(idOrSlug),
      }),
    fighterScoringQuery: (
      fighterId: string | undefined,
      { scoringProfile, fightId }: { scoringProfile: string; fightId?: string },
    ) =>
      queryOptions({
        queryKey: ["fighters", fighterId, "scoring", { scoringProfile, fightId }],
        queryFn: async () => {
          if (isNullish(fighterId)) throw new Error("fighterId is required");
          if (!fightId) throw new Error("fightId is required");

          const res = await apiClient.v1.fighters[":fighterId"].scoring.$get({
            param: { fighterId },
            query: { scoringProfile, fightId },
          });
          if (!res.ok) throw new Error("Failed to fetch fighter scoring");
          return res.json();
        },
        enabled: Boolean(fighterId) && Boolean(scoringProfile) && Boolean(fightId),
      }),

    // CONFIG / MISC
    featureFlagsQuery: ({ bustCache = false }: BustCacheOptions = {}) =>
      queryOptions({
        queryKey: ["feature-flags"],
        queryFn: async () => {
          const res = await apiClient.v1.config.flags.$get({
            query: { timestamp: bustCache ? Date.now().toString() : undefined },
          });
          if (!res.ok) return {} as Record<string, boolean>;
          return res.json();
        },
        staleTime: 1000 * 60 * 15,
        placeholderData: {} as Record<string, boolean>,
      }),
    appConfigQuery: ({ bustCache = false }: BustCacheOptions = {}) =>
      queryOptions({
        queryKey: ["app-config"],
        queryFn: async () => {
          const res = await apiClient.v1.config.app.$get({
            query: { timestamp: bustCache ? Date.now().toString() : undefined },
          });
          if (!res.ok) return null;
          return res.json();
        },
        staleTime: 1000 * 60 * 15,
        placeholderData: null,
      }),
  };
};
