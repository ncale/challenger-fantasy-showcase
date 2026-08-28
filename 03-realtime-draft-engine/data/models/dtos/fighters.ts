import type { FighterDto, FighterSimpleDto } from "../../../schemas";
import type { EventFightersView, Fighter } from "../../../types";

export const mapFighterToSimpleDtoFromView = (fighter: EventFightersView): FighterSimpleDto => {
  return {
    id: fighter.fighter_id,
    name: fighter.fighter_name,
    slug: fighter.fighter_slug,
  };
};

export const mapFighterToSimpleDto = (fighter: Fighter): FighterSimpleDto => {
  if (!fighter.full_name) {
    throw new Error(`Invalid data error. A fighter full name is 'null' for ${fighter.id}.`);
  }

  return {
    id: fighter.id,
    name: fighter.full_name,
    slug: fighter.slug,
    // rating: 0,
  };
};

export const mapFighterToDto = (fighter: Fighter): FighterDto => {
  if (!fighter.full_name) {
    throw new Error(`Invalid data error. A fighter full name is 'null' for ${fighter.id}.`);
  }

  return {
    id: fighter.id,
    name: fighter.full_name,
    slug: fighter.slug,
    dob: fighter.dob ?? "",
    heightIn: fighter.height_in ?? 0,
    reachIn: fighter.reach_in ?? 0,
    stance: fighter.stance ?? "",
    country: fighter.country ?? "",
  };
};
