/**
 * Centralized registry for Durable Object namespacing
 * and ctx.storage key lookups.
 */
export const CF_REGISTRY = {
  draftManagerDO: {
    getName: (key: { gameId: string }) => `draft-manager:${key.gameId}`,
    getDemoName: (key: { gameId: string }) => `demo:draft-manager:${key.gameId}`,
    storage: {
      currentGroupId: "current-group-id",
    },
  },
  draftServerDO: {
    getName: (key: { groupId: string }) => `draft-server:${key.groupId}`,
    storage: {
      gameData: "game",
      draftGroupId: "draft-group-id",
      draftState: "draft-state",
      resultsSavedFlag: "results-saved",
      isDemoFlag: "is-demo",
    },
  },
} as const;
