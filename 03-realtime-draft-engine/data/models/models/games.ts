import {
  type GameConfig,
  type GameMetadata,
  gameConfigSchema,
  gameMetadataSchema,
} from "../../../schemas";
import type { Database, Json, Overwrite, Prettify } from "../../../types";
import type { HydratedFight } from "./fights.ts";

// GAMES - Hydrated parses game metadata and config

// GENERIC

type PlainGame = { metadata: Json; config: Json };

type HydratedGenericGame<T extends PlainGame> = Prettify<
  Overwrite<
    T,
    {
      metadata: GameMetadata;
      config: GameConfig;
    }
  >
>;

function hydrateGenericGame<T extends PlainGame>(game: T): HydratedGenericGame<T> {
  const metadata = gameMetadataSchema.parse(game.metadata);
  const config = gameConfigSchema.parse(game.config);

  return { ...game, metadata, config };
}

// NON-GENERIC

type Game = Pick<
  Database["public"]["Tables"]["daily_mma_game"]["Row"],
  "id" | "event_id" | "config" | "metadata"
>;

export type HydratedGame = HydratedGenericGame<Game>;

export function hydrateGame(game: Game): HydratedGame {
  return hydrateGenericGame(game);
}

// GAME SELECTABLES

export type SelectableFighter = {
  id: string;
  name: string;
  slug: string;
};

export type GameSelectables = {
  fights: HydratedFight[];
  fighters: SelectableFighter[];
};

export function getGameSelectables(
  game: HydratedGame,
  eventFights: HydratedFight[],
): GameSelectables {
  const fights =
    game.config.selectFrom.kind === "top_fights"
      ? eventFights.slice(0, game.config.selectFrom.number)
      : eventFights;

  const fighters = fights.flatMap((f) => [
    { id: f.fighter_1_id, name: f.fighter_1_name, slug: f.fighter_1_slug },
    { id: f.fighter_2_id, name: f.fighter_2_name, slug: f.fighter_2_slug },
  ]);

  return { fights, fighters };
}
