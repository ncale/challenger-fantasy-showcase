import type { FighterDto } from "../schemas";
import type { FighterModel } from "../types";

// TODO: this DTO schema should not overwrite nullish values with empty string or 0 - this is
// an anti-pattern. Instead, the schema should allow nullish values and the frontend should
// handle them appropriately.

export const mapFighterToDto = (model: FighterModel): FighterDto => ({
  ...model,
  dob: model.dob ?? "",
  heightIn: model.heightIn ?? 0,
  reachIn: model.reachIn ?? 0,
  stance: model.stance ?? "",
  country: model.country ?? "",
});
