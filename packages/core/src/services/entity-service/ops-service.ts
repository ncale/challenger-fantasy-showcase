import type { AliasedEvents, AliasedFights, DBClient } from "@challenger-fantasy/types";
import { EntityServiceError } from "../../lib/errors.ts";

/**
 * Service class for managing ops entities with external ID alias tracking
 */
export class OpsService {
  constructor(private supabase: DBClient) {}

  async getAliasedEvents(): Promise<AliasedEvents[]> {
    const { data, error } = await this.supabase.schema("ops").from("aliased_events").select("*");
    if (error)
      throw new EntityServiceError(`Failed to get aliased events: ${error.message}`, error);
    return data;
  }

  async getAliasedFights(): Promise<AliasedFights[]> {
    const { data, error } = await this.supabase.schema("ops").from("aliased_fights").select("*");
    if (error)
      throw new EntityServiceError(`Failed to get aliased fights: ${error.message}`, error);
    return data;
  }

  async getNextScheduledEvent(): Promise<AliasedEvents> {
    const { data, error } = await this.supabase
      .schema("ops")
      .from("aliased_events")
      .select("*")
      .eq("status", "scheduled")
      .order("event_date", { ascending: true })
      .limit(1)
      .single();
    if (error) throw new EntityServiceError(`Failed to find scheduled event: ${error.message}`);
    return data;
  }

  async getExternalFights(externalIds: string[]): Promise<AliasedFights[]> {
    const { data, error } = await this.supabase
      .schema("ops")
      .from("aliased_fights")
      .select("*")
      .in("fight_external_id", externalIds);
    if (error) throw new EntityServiceError(`Failed to get external fights: ${error.message}`);
    return data;
  }
}
