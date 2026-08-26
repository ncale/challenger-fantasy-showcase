import type { Database, UserProfile } from "@challenger-fantasy/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import z from "zod";

export class UserService {
  constructor(private supabase: SupabaseClient<Database>) {}

  private async getProfileFromUsername(username: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .schema("api")
      .from("user_profile_view")
      .select("*")
      .ilike("username", username.toLowerCase())
      .single();
    if (error) throw error;
    return data;
  }

  private async getProfileFromUserId(id: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .schema("api")
      .from("user_profile_view")
      .select("*")
      .eq("user_id", id)
      .single();
    if (error) throw error;
    return data;
  }

  public async getProfile(usernameOrId: string): Promise<UserProfile> {
    if (z.uuid().safeParse(usernameOrId).success) {
      return this.getProfileFromUserId(usernameOrId);
    }
    return this.getProfileFromUsername(usernameOrId);
  }

  public async isUsernameReserved(username: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .schema("public")
      .from("user_profile")
      .select("*")
      .ilike("username", username)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return false;
      }
      throw error; // Throw any other errors
    }
    return data !== null;
  }

  public async setUsername(id: string, username: string): Promise<void> {
    const { error } = await this.supabase
      .schema("public")
      .from("user_profile")
      .update({ username })
      .eq("user_id", id);
    if (error) throw error;
  }
}
