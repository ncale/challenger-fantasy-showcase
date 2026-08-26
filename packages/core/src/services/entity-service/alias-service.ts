import type { Alias, AliasInsert, DataSource, DBClient } from "@challenger-fantasy/types";
import { EntityServiceError } from "../../lib/errors";

// TODO: return null if no record found, but throw for all other errors

export class AliasService {
  constructor(private supabase: DBClient) {}

  /**
   * Gets an alias mapping by source, external ID, and entity type
   */
  public async get(source: DataSource): Promise<Alias | null> {
    const { data, error } = await this.supabase
      .from("alias")
      .select("*")
      .eq("source", source.name)
      .eq("external_id", source.externalId)
      .eq("entity_type", source.entityType)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Creates an alias mapping between external and internal IDs
   */
  public async upsert(source: DataSource, internalId: string): Promise<void> {
    try {
      const aliasData: AliasInsert = {
        source: source.name,
        external_id: source.externalId.trim(),
        entity_type: source.entityType.trim(),
        internal_id: internalId.trim(),
      };

      const { error } = await this.supabase
        .from("alias")
        .upsert(aliasData, { onConflict: "source,external_id,entity_type" });

      if (error) throw new EntityServiceError(`Failed to upsert alias: ${error.message}`, error);
    } catch (error) {
      if (error instanceof EntityServiceError) throw error;
      throw new EntityServiceError(
        `Failed to upsert alias for ${source.entityType} ${source.externalId}`,
        error,
      );
    }
  }

  /**
   * Gets the internal ID for an entity by its external ID
   */
  async getInternalId(source: DataSource): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("alias")
      .select("internal_id")
      .eq("source", source.name)
      .eq("external_id", source.externalId)
      .eq("entity_type", source.entityType)
      .single();

    if (error) return null;
    return data?.internal_id ?? null;
  }
}
