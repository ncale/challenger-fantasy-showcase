import type {
  DataSourceEvent,
  DBClient,
  DisallowId,
  Event,
  EventInsert,
} from "@challenger-fantasy/types";
import { assertAliasType } from "../../lib/assertions.ts";
import { EntityServiceError } from "../../lib/errors.ts";
import type { AliasService } from "./alias-service.ts";

/**
 * Service class for managing events with external ID alias tracking
 */
export class EventService {
  constructor(
    private supabase: DBClient,
    private aliasService: AliasService,
  ) {}

  public async markFightsAsCancelled(eventId: string): Promise<void> {
    const { error } = await this.supabase
      .from("fight")
      .update({ status: "cancelled", fight_order: null })
      .eq("event_id", eventId);
    if (error)
      throw new EntityServiceError(`Failed to mark fights as cancelled: ${error.message}`, error);
  }

  private async updateExisting(
    insert: DisallowId<EventInsert>,
    existingInternalId: string,
  ): Promise<Event> {
    const { data, error } = await this.supabase
      .from("event")
      .update(insert)
      .eq("id", existingInternalId)
      .select()
      .single();
    if (error) throw new EntityServiceError(`Failed to update event: ${error.message}`, error);

    return data;
  }

  async addNew(source: DataSourceEvent, insert: DisallowId<EventInsert>): Promise<Event> {
    const { data: event, error } = await this.supabase
      .from("event")
      .upsert(insert, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw new EntityServiceError(`Failed to insert event: ${error.message}`, error);

    await this.aliasService.upsert(source, event.id);

    return event;
  }

  /**
   * Upserts an event and manages its alias mapping
   */
  async upsertWithAlias(source: DataSourceEvent, insert: DisallowId<EventInsert>): Promise<Event> {
    try {
      const existingAlias = await this.aliasService.get(source);
      assertAliasType(existingAlias, "event");
      const existingInternalId = existingAlias?.internal_id;

      let event: Event;
      if (existingInternalId) {
        event = await this.updateExisting(insert, existingInternalId);
      } else {
        event = await this.addNew(source, insert);
      }

      return event;
    } catch (error) {
      if (error instanceof EntityServiceError) throw error;
      throw new EntityServiceError(
        `Failed to upsert event with external ID ${source.externalId}`,
        error,
      );
    }
  }
}
