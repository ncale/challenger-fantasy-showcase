import type {
  DataSourceFight,
  DBClient,
  DisallowId,
  Fight,
  FightInsert,
  FightRoundSnapshot,
  FightRoundSnapshotInsert,
} from "@challenger-fantasy/types";
import { assertAliasType } from "../../lib/assertions.ts";
import { EntityServiceError } from "../../lib/errors.ts";
import type { AliasService } from "./alias-service.ts";

/**
 * Service class for managing fights with external ID alias tracking
 */
export class FightService {
  constructor(
    private supabase: DBClient,
    private aliasService: AliasService,
  ) {}

  private async updateExisting(
    insert: DisallowId<FightInsert>,
    existingInternalId: string,
  ): Promise<Fight> {
    const { data, error } = await this.supabase
      .from("fight")
      .update(insert)
      .eq("id", existingInternalId)
      .select()
      .single();
    if (error) throw new EntityServiceError(`Failed to update fight: ${error.message}`, error);

    return data;
  }

  async addNew(source: DataSourceFight, insert: DisallowId<FightInsert>): Promise<Fight> {
    const { data: fight, error } = await this.supabase
      .from("fight")
      .insert(insert)
      .select()
      .single();
    if (error) throw new EntityServiceError(`Failed to insert fight: ${error.message}`, error);

    await this.aliasService.upsert(source, fight.id);

    return fight;
  }

  /**
   * Upserts a fight and manages its alias mapping
   */
  async upsertWithAlias(source: DataSourceFight, insert: DisallowId<FightInsert>): Promise<Fight> {
    try {
      const existingAlias = await this.aliasService.get(source);
      assertAliasType(existingAlias, "fight");
      const existingInternalId = existingAlias?.internal_id;

      let fight: Fight;
      if (existingInternalId) {
        fight = await this.updateExisting(insert, existingInternalId);
      } else {
        fight = await this.addNew(source, insert);
      }

      return fight;
    } catch (error) {
      if (error instanceof EntityServiceError) throw error;
      throw new EntityServiceError(
        `Failed to upsert fight with external ID ${source.externalId}`,
        error,
      );
    }
  }

  async upsertRoundSnapshots(insert: FightRoundSnapshotInsert[]): Promise<FightRoundSnapshot[]> {
    const { data, error } = await this.supabase
      .from("fight_round_snapshot")
      .upsert(insert, {
        onConflict: "fight_id,round",
      })
      .select();
    if (error)
      throw new EntityServiceError(`Failed to upsert round snapshots: ${error.message}`, error);

    return data;
  }
}
