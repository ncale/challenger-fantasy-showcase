import type {
  AliasedEvents,
  AliasedFights,
  DataSource,
  DataSourceEvent,
  DataSourceFight,
  DataSourceFighter,
  DBClient,
  DisallowId,
  Event,
  EventInsert,
  Fight,
  Fighter,
  FighterInsert,
  FightInsert,
  FightRoundSnapshot,
  FightRoundSnapshotInsert,
} from "@challenger-fantasy/types";
import { AliasService } from "./alias-service.ts";
import { EventService } from "./event-service.ts";
import { FightService } from "./fight-service.ts";
import { FighterService } from "./fighter-service.ts";
import { OpsService } from "./ops-service.ts";

/**
 * Service class for managing entities (events, fights, fighters) with external ID alias tracking
 */
export class EntityService {
  private aliasService: AliasService;
  private eventService: EventService;
  private fightService: FightService;
  private fighterService: FighterService;
  private opsService: OpsService;

  constructor(supabase: DBClient) {
    this.aliasService = new AliasService(supabase);

    this.eventService = new EventService(supabase, this.aliasService);
    this.fightService = new FightService(supabase, this.aliasService);
    this.fighterService = new FighterService(supabase, this.aliasService);

    this.opsService = new OpsService(supabase);
  }

  // Extend methods from services
  async getInternalId(source: DataSource): Promise<string | null> {
    return await this.aliasService.getInternalId(source);
  }

  async markEventFightsAsCancelled(eventId: string): Promise<void> {
    return await this.eventService.markFightsAsCancelled(eventId);
  }
  async upsertEvent(source: DataSourceEvent, insert: DisallowId<EventInsert>): Promise<Event> {
    return await this.eventService.upsertWithAlias(source, insert);
  }

  async upsertFight(source: DataSourceFight, insert: DisallowId<FightInsert>): Promise<Fight> {
    return await this.fightService.upsertWithAlias(source, insert);
  }

  async upsertRoundSnapshots(insert: FightRoundSnapshotInsert[]): Promise<FightRoundSnapshot[]> {
    return await this.fightService.upsertRoundSnapshots(insert);
  }

  async upsertFighter(
    source: DataSourceFighter,
    insert: DisallowId<FighterInsert>,
  ): Promise<Fighter> {
    return await this.fighterService.upsertWithAlias(source, insert);
  }

  async getNextScheduledEvent(): Promise<AliasedEvents> {
    return await this.opsService.getNextScheduledEvent();
  }

  async getExternalFights(externalIds: string[]): Promise<AliasedFights[]> {
    return await this.opsService.getExternalFights(externalIds);
  }
}
