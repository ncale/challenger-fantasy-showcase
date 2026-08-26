import type { Alias, EntityType } from "@challenger-fantasy/types";
import { InvariantError } from "./errors";

export function assertAliasType(alias: Alias | null, entityType: EntityType): void {
  if (alias && alias.entity_type !== entityType) {
    throw new InvariantError(`Alias for ${alias.external_id} is not a ${entityType}`);
  }
}
