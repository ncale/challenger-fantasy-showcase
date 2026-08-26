import type {
  DataSourceFighter,
  DBClient,
  DisallowId,
  Fighter,
  FighterInsert,
} from "@challenger-fantasy/types";
import { assertAliasType } from "../../lib/assertions.ts";
import { EntityServiceError } from "../../lib/errors.ts";
import type { AliasService } from "./alias-service.ts";

/**
 * Service class for managing fighters with external ID alias tracking
 */
export class FighterService {
  constructor(
    private supabase: DBClient,
    private aliasService: AliasService,
  ) {}

  private async updateExisting(
    insert: DisallowId<FighterInsert>,
    existingInternalId: string,
  ): Promise<Fighter> {
    const { data, error } = await this.supabase
      .from("fighter")
      .update(insert)
      .eq("id", existingInternalId)
      .select()
      .single();
    if (error) throw new EntityServiceError(`Failed to update fighter: ${error.message}`, error);

    return data;
  }

  async addNew(source: DataSourceFighter, insert: DisallowId<FighterInsert>): Promise<Fighter> {
    const { data: fighter, error } = await this.supabase
      .from("fighter")
      .upsert(insert, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw new EntityServiceError(`Failed to insert fighter: ${error.message}`, error);

    await this.aliasService.upsert(source, fighter.id);

    return fighter;
  }

  /**
   * Upserts a fighter and manages its alias mapping
   */
  async upsertWithAlias(
    source: DataSourceFighter,
    insert: DisallowId<FighterInsert>,
  ): Promise<Fighter> {
    try {
      const existingAlias = await this.aliasService.get(source);
      assertAliasType(existingAlias, "fighter");
      const existingInternalId = existingAlias?.internal_id;

      let fighter: Fighter;
      if (existingInternalId) {
        fighter = await this.updateExisting(insert, existingInternalId);
      } else {
        fighter = await this.addNew(source, insert);
      }

      return fighter;
    } catch (error) {
      if (error instanceof EntityServiceError) throw error;
      throw new EntityServiceError(
        `Failed to upsert fighter with external ID ${source.externalId}`,
        error,
      );
    }
  }
}
