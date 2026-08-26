import {
  hydrateEvent,
  hydrateFight,
  hydrateGame,
  hydrateSubmission,
} from "@challenger-fantasy/models";
import type { SaveDraftSubmissionsInput } from "@challenger-fantasy/schemas";
import type {
  DBClient,
  EventListOptions,
  LimitOptions,
  PagePaginationOptions,
  SearchOptions,
} from "@challenger-fantasy/types";
import { isUuid } from "./utils.ts";

// TODO: remove hydration logic from this file - all gets handled in api DTO validation; just return raw data

class DataClient {
  private supabase: DBClient;

  constructor(supabase: DBClient) {
    this.supabase = supabase;
  }

  public users = {
    getProfile: async (userId: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("user_profile_view")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    // TODO: I'm not sure this is needed. Submissions are ususally fetched by "live/upcoming/completed".
    getSubmissions: async (userId: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("daily_mma_game_submissions_view")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;

      const hydratedSubmissions = data.map(hydrateSubmission);
      return hydratedSubmissions;
    },
    getLiveSubmissions: async (
      userId: string,
      { page = 0, pageSize = 4 }: PagePaginationOptions = {},
    ) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("daily_mma_game_submissions_view")
        .select("*")
        .eq("user_id", userId)
        .eq("event_status", "live")
        // If there is more than one event, this should group them.
        .order("start_time", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) throw error;

      const hydratedSubmissions = data.map(hydrateSubmission);
      return hydratedSubmissions;
    },
    getUpcomingSubmissions: async (
      userId: string,
      { page = 0, pageSize = 4 }: PagePaginationOptions = {},
    ) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("daily_mma_game_submissions_view")
        .select("*")
        .eq("user_id", userId)
        .eq("event_status", "scheduled")
        // If there is more than one event, this should group them.
        .order("start_time", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) throw error;

      const hydratedSubmissions = data.map(hydrateSubmission);
      return hydratedSubmissions;
    },
    getCompletedSubmissions: async (
      userId: string,
      { page = 0, pageSize = 4 }: PagePaginationOptions = {},
    ) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("daily_mma_game_submissions_view")
        .select("*")
        .eq("user_id", userId)
        .eq("event_status", "final")
        // If there is more than one event, this should group them.
        .order("start_time", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) throw error;

      const hydratedSubmissions = data.map(hydrateSubmission);
      return hydratedSubmissions;
    },
    getPickRanking: async (
      userId: string,
      eventId: string,
    ): Promise<{ fighterIds: string[] } | null> => {
      const { data: ranking, error: rankingError } = await this.supabase
        .schema("public")
        .from("user_pick_ranking")
        .select("id")
        .eq("user_id", userId)
        .eq("event_id", eventId)
        .eq("mode", "standard")
        .maybeSingle();
      if (rankingError) throw rankingError;
      if (!ranking) return null;

      const { data: entries, error: entriesError } = await this.supabase
        .schema("public")
        .from("user_pick_ranking_entry")
        .select("fighter_id")
        .eq("ranking_id", ranking.id)
        .order("position", { ascending: true });
      if (entriesError) throw entriesError;

      return { fighterIds: entries.map((e) => e.fighter_id) };
    },
    upsertPickRanking: async (
      userId: string,
      eventId: string,
      fighterIds: string[],
    ): Promise<{ fighterIds: string[] }> => {
      const { data: ranking, error: rankingError } = await this.supabase
        .schema("public")
        .from("user_pick_ranking")
        .upsert(
          {
            user_id: userId,
            event_id: eventId,
            mode: "standard",
            // TODO: we should make this a DB trigger
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,event_id,mode" },
        )
        .select("id")
        .single();
      if (rankingError) throw rankingError;

      const { error: deleteError } = await this.supabase
        .schema("public")
        .from("user_pick_ranking_entry")
        .delete()
        .eq("ranking_id", ranking.id);
      if (deleteError) throw deleteError;

      if (fighterIds.length > 0) {
        const { error: insertError } = await this.supabase
          .schema("public")
          .from("user_pick_ranking_entry")
          .insert(
            fighterIds.map((fighterId, index) => ({
              ranking_id: ranking.id,
              fighter_id: fighterId,
              position: index,
            })),
          );
        if (insertError) throw insertError;
      }

      return { fighterIds };
    },
    getStats: async (userId: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("daily_mma_game_submissions_view")
        .select("position")
        .eq("user_id", userId)
        .eq("event_status", "final");
      if (error) throw error;

      const gamesPlayed = data.length;
      const gamesWon = data.filter((s) => s.position === 1).length;
      const winPercentage = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

      return { gamesPlayed, gamesWon, winPercentage };
    },
  };

  public events = {
    getList: async ({
      status,
      page = 0,
      pageSize = 20,
    }: EventListOptions & PagePaginationOptions = {}) => {
      let query = this.supabase.schema("public").from("event").select("*", { count: "exact" });

      switch (status) {
        case "upcoming": {
          query = query.eq("status", "scheduled").order("event_date", { ascending: true });
          break;
        }
        case "past": {
          query = query.eq("status", "final").order("event_date", { ascending: false });
          break;
        }
        case "upcoming-or-live": {
          query = query
            .in("status", ["scheduled", "live"])
            .order("event_date", { ascending: true });
          break;
        }
      }

      const { data, error, count } = await query.range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      return {
        data: data.map(hydrateEvent),
        total: count ?? 0,
        page,
        pageSize,
      };
    },
    getBySlug: async (slug: string) => {
      const { data, error } = await this.supabase
        .schema("public")
        .from("event")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return hydrateEvent(data);
    },
    getById: async (id: string) => {
      const { data, error } = await this.supabase
        .schema("public")
        .from("event")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return hydrateEvent(data);
    },
    getOne: async (idOrSlug: string) => {
      if (isUuid(idOrSlug)) {
        return this.events.getById(idOrSlug);
      } else {
        return this.events.getBySlug(idOrSlug);
      }
    },
    getGames: async (eventId: string) => {
      const { data, error } = await this.supabase
        .schema("public")
        .from("daily_mma_game")
        .select("id, event_id, config, metadata")
        .eq("event_id", eventId)
        .order("config->mode->numPeople", { ascending: true });
      if (error) throw error;

      const hydratedGames = data.map(hydrateGame);
      hydratedGames.sort((a, b) =>
        b.metadata.enabled === a.metadata.enabled ? 0 : b.metadata.enabled ? 1 : -1,
      );

      return hydratedGames;
    },
    getFights: async (eventId: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("event_fights_view")
        .select("*")
        .neq("status", "cancelled")
        .order("fight_order", { ascending: true })
        .eq("event_id", eventId);
      if (error) throw error;

      return data.map(hydrateFight);
    },
    getFighters: async (eventId: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("event_fighters_view")
        .select("*")
        .eq("event_id", eventId);
      if (error) throw error;

      return data;
    },
    getLatestOddsForFights: async (fightIds: string[]): Promise<Map<string, number>> => {
      if (!fightIds.length) return new Map();

      const { data, error } = await this.supabase
        .from("odds_snapshot")
        .select("fighter_id, fair_probability, fetched_at")
        .in("fight_id", fightIds)
        .order("fetched_at", { ascending: false });
      if (error) throw error;

      // Data is sorted desc by fetched_at — first occurrence per fighter_id is the latest.
      const map = new Map<string, number>();
      for (const row of data ?? []) {
        if (!map.has(row.fighter_id)) {
          map.set(row.fighter_id, row.fair_probability);
        }
      }
      return map;
    },
  };

  public games = {
    getAllSubmissionCounts: async () => {
      throw new Error("Not implemented");
    },
    getOne: async (gameId: string) => {
      const { data, error } = await this.supabase
        .schema("public")
        .from("daily_mma_game")
        .select("id, event_id, config, metadata")
        .eq("id", gameId)
        .single();
      if (error) throw error;

      return hydrateGame(data);
    },
  };

  public submissions = {
    getOne: async (submissionId: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("daily_mma_game_submissions_view")
        .select("*")
        .eq("id", submissionId)
        .single();
      if (error) throw error;

      return hydrateSubmission(data);
    },
    getPicks: async (submissionId: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("daily_mma_game_submission_picks_view")
        .select("*")
        .eq("submission_id", submissionId);
      if (error) throw error;

      return data;
    },
    getDraftGroupSubmissions: async (draftGroupId: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("draft_group_submission_view")
        .select("*")
        .eq("draft_group_id", draftGroupId);
      if (error) throw error;

      return data;
    },
    getPicksByGameId: async (gameId: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("daily_mma_game_submission_picks_view")
        .select("*")
        .eq("game_id", gameId);
      if (error) throw error;

      return data;
    },
    updateName: async (submissionId: string, userId: string, name: string | null) => {
      const { error } = await this.supabase
        .schema("public")
        .from("daily_mma_game_submission")
        .update({ metadata: name ? { name } : {} })
        .eq("id", submissionId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    saveDraft: async (input: {
      gameId: string;
      draftGroupId: string;
      submissions: SaveDraftSubmissionsInput;
    }) => {
      const { data, error } = await this.supabase.schema("ops").rpc("save_draft_submissions", {
        p_game_id: input.gameId,
        p_draft_group_id: input.draftGroupId,
        p_submissions: input.submissions,
      });
      if (error) throw error;

      return data;
    },
  };

  public fights = {
    getOneById: async (id: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("event_fights_view")
        .select("*")
        .eq("fight_id", id)
        .single();
      if (error) throw error;
      return hydrateFight(data);
    },
    getOneBySlug: async (slug: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("event_fights_view")
        .select("*")
        .eq("fight_slug", slug)
        .single();
      if (error) throw error;
      return hydrateFight(data);
    },
    getOne: async (idOrSlug: string) => {
      if (isUuid(idOrSlug)) {
        return this.fights.getOneById(idOrSlug);
      } else {
        return this.fights.getOneBySlug(idOrSlug);
      }
    },
    getPreFightStatsById: async (id: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("fight_pre_fight_stats_view")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    getPreFightStatsBySlug: async (slug: string) => {
      const { data, error } = await this.supabase
        .schema("api")
        .from("fight_pre_fight_stats_view")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    getPreFightStats: async (idOrSlug: string) => {
      if (isUuid(idOrSlug)) {
        return this.fights.getPreFightStatsById(idOrSlug);
      } else {
        return this.fights.getPreFightStatsBySlug(idOrSlug);
      }
    },
  };

  public fighters = {
    getMany: async ({
      page = 0,
      pageSize = 20,
      query: searchQuery,
    }: PagePaginationOptions & SearchOptions = {}) => {
      let query = this.supabase.schema("public").from("fighter").select("*", { count: "exact" });

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error, count } = await query
        .order("search_priority", { ascending: false })
        .order("name", { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      return { data, total: count ?? 0, page, pageSize };
    },
    getPopular: async ({ limit = 10 }: LimitOptions = {}) => {
      const { data, error, count } = await this.supabase
        .schema("public")
        .from("fighter")
        .select("*")
        .order("search_priority", { ascending: false })
        .order("full_name", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return { data, total: count ?? 0 };
    },
    getOneSimpleById: async (id: string) => {
      const { data, error } = await this.supabase
        .schema("public")
        .from("fighter")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    getOneSimpleBySlug: async (slug: string) => {
      const { data, error } = await this.supabase
        .schema("public")
        .from("fighter")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    getOneSimple: async (idOrSlug: string) => {
      if (isUuid(idOrSlug)) {
        return this.fighters.getOneSimpleById(idOrSlug);
      } else {
        return this.fighters.getOneSimpleBySlug(idOrSlug);
      }
    },
    getById: async (id: string) => {
      const { data, error } = await this.supabase
        .schema("public")
        .from("fighter")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    getBySlug: async (slug: string) => {
      const { data, error } = await this.supabase
        .schema("public")
        .from("fighter")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    getOne: async (idOrSlug: string) => {
      if (isUuid(idOrSlug)) {
        return this.fighters.getById(idOrSlug);
      } else {
        return this.fighters.getBySlug(idOrSlug);
      }
    },
  };
}

export function createDataClient(supabase: DBClient): DataClient {
  return new DataClient(supabase);
}

export type { DataClient };
