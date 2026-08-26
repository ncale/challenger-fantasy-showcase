import type {
  Database,
  FighterExplorerQueryOptions,
  QueryOptions,
  SearchFightersReturn,
} from "@challenger-fantasy/types";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../env";
import { EventPageService } from "./event-page-service";
import { FightPageService } from "./fight-page-service";
import { FighterExplorerService } from "./fighter-explorer-service";
import { FighterPageService } from "./fighter-page-service";
import { HeroFighterService } from "./hero-fighter-service";
import { SearchService } from "./search-service";
import { UserService } from "./user-service";

// DATA CLIENT

class DataClient {
  public supabase: SupabaseClient<Database>;
  private searchService: SearchService;
  private fighterPageService: FighterPageService;
  private eventPageService: EventPageService;
  private fightPageService: FightPageService;
  private userService: UserService;
  private heroFighterService: HeroFighterService;
  private fighterExplorerService: FighterExplorerService;

  constructor(url: string, anonKey: string) {
    this.supabase = createClient<Database>(url, anonKey);

    this.searchService = new SearchService(this.supabase);
    this.fighterPageService = new FighterPageService(this.supabase);
    this.eventPageService = new EventPageService(this.supabase);
    this.fightPageService = new FightPageService(this.supabase);
    this.userService = new UserService(this.supabase);
    this.heroFighterService = new HeroFighterService(this.supabase);
    this.fighterExplorerService = new FighterExplorerService(this.supabase);
  }

  // WRAPPERS

  async searchFighters(query: string, options?: QueryOptions): Promise<SearchFightersReturn> {
    return await this.searchService.searchFighters(query, options);
  }

  async getEventHeader(slug: string) {
    return await this.eventPageService.getHeader(slug);
  }
  async getEventFights(slug: string) {
    return await this.eventPageService.getFights(slug);
  }

  async getFighterPageHeaderAndStats(slug: string) {
    return await this.fighterPageService.getHeaderAndStats(slug);
  }
  async getFighterPageFights(slug: string, limit?: number) {
    return await this.fighterPageService.getFights(slug, limit);
  }
  async getFighterAggregatedStats(slug: string) {
    return await this.fighterPageService.getAggregatedStats(slug);
  }

  async getFightPage(id: string) {
    return await this.fightPageService.getPage(id);
  }
  async getFightStats(id: string) {
    return await this.fightPageService.getFightStats(id);
  }
  async getPreFightStats(fightId: string) {
    return await this.fightPageService.getPreFightStats(fightId);
  }

  async getUserProfile(usernameOrId: string) {
    return await this.userService.getProfile(usernameOrId);
  }
  async isUsernameReserved(username: string) {
    return await this.userService.isUsernameReserved(username);
  }
  async setUsername(id: string, username: string) {
    return await this.userService.setUsername(id, username);
  }

  async getHeroFighterUpcomingGames() {
    return await this.heroFighterService.getUpcomingGames();
  }
  async getHeroFighterGame(gameId: string) {
    return await this.heroFighterService.getGame(gameId);
  }
  async getHeroFighterFightersBreakdown(gameId: string) {
    return await this.heroFighterService.getFightersBreakdown(gameId);
  }
  async getHeroFighterGameEntries(gameId: string) {
    return await this.heroFighterService.getGameEntries(gameId);
  }

  async getFighters(options?: FighterExplorerQueryOptions) {
    return await this.fighterExplorerService.getFighters(options);
  }

  // ALL

  async getUpcomingEvents(options?: QueryOptions) {
    const { data, error } = await this.supabase
      .from("event")
      .select("*")
      .gte("event_date", new Date().toISOString())
      .eq("status", "scheduled")
      .order("event_date", { ascending: true })
      .limit(options?.limit ?? 10);
    if (error) throw error;
    return data;
  }

  async getPastEvents(options?: QueryOptions) {
    const { data, error } = await this.supabase
      .from("event")
      .select("*")
      .lt("event_date", new Date().toISOString())
      .order("event_date", { ascending: false })
      .limit(options?.limit ?? 10);
    if (error) throw error;
    return data;
  }

  async getPopularFighters(options?: QueryOptions) {
    const { data, error, statusText } = await this.supabase
      .from("fighter")
      .select("*")
      .order("search_priority", { ascending: false })
      .limit(options?.limit ?? 10);
    if (error) {
      throw new Error(statusText);
    }
    return data;
  }
}

export const dataClient = new DataClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
