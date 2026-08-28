import type { GameConfig, GameMetadata } from "../../schemas";

// TODO: move to shared utils
export function getGameName(config: GameConfig, metadata: GameMetadata): string {
  if (metadata.version === 1 && metadata.name !== undefined) return metadata.name;
  if (config.version === 1 && config.mode.kind === "draft")
    return `${config.mode.numPeople} Person Draft`;
  if (config.version === 1 && config.mode.kind === "solo") return "Solo";

  throw new Error(`Invalid game config: ${JSON.stringify(config)}`);
}
