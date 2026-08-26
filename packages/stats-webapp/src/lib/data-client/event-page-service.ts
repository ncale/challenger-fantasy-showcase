import type { Database, EventHeaderView, FightsListView } from "@challenger-fantasy/types";
import type { SupabaseClient } from "@supabase/supabase-js";

// DATA CLIENT

export class EventPageService {
  constructor(private supabase: SupabaseClient<Database>) {}

  public async getHeader(slug: string): Promise<EventHeaderView> {
    const { data, error } = await this.supabase
      .schema("api")
      .from("event_header_view")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data;
  }

  public async getFights(slug: string): Promise<FightsListView[]> {
    const { data, error } = await this.supabase
      .schema("api")
      .from("fights_list_view")
      .select("*")
      .eq("event_slug", slug)
      .neq("status", "cancelled")
      .limit(100);
    if (error) throw error;
    return data;
  }
}
