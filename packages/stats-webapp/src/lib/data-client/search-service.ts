import type { Database, SearchFightersReturn } from "@challenger-fantasy/types";
import type { SupabaseClient } from "@supabase/supabase-js";

// DATA CLIENT

type QueryOptions = {
  limit?: number;
};

export class SearchService {
  constructor(private supabase: SupabaseClient<Database>) {}

  // Search methods
  async searchFighters(query: string, options?: QueryOptions): Promise<SearchFightersReturn> {
    const { data, error, statusText } = await this.supabase
      .schema("api")
      .rpc("search_fighters", { q: query })
      .limit(options?.limit ?? 10);
    if (error) {
      throw new Error(statusText);
    }
    return data;
  }
}
