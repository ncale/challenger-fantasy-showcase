import { DurableObject } from "cloudflare:workers";
import { CF_REGISTRY } from "../data";
import { type AppLoggers, createLogger } from "../logger";
import { getGameSelectables, type HydratedGame } from "../data/models";
import {
  type DailyMmaGameSubmissionMetadata,
  type Drafter,
  type DraftServerMessage,
  type DraftState,
  draftServerMessageSchema,
} from "../schemas";
import { isNullish } from "../data/utils";
import { v4 as uuidv4 } from "uuid";
import { getDataClient } from "../lib/data";
import { DraftLobby } from "../lib/draft-lobby";
import { DraftProtocol, ROUTES } from "../lib/draft-protocol";

const GAME_KEY = CF_REGISTRY.draftServerDO.storage.gameData;
const DRAFT_GROUP_ID_KEY = CF_REGISTRY.draftServerDO.storage.draftGroupId;
const DRAFT_STATE_KEY = CF_REGISTRY.draftServerDO.storage.draftState;
const RESULTS_SAVED_KEY = CF_REGISTRY.draftServerDO.storage.resultsSavedFlag;
const IS_DEMO_KEY = CF_REGISTRY.draftServerDO.storage.isDemoFlag;

export class DraftServer extends DurableObject {
  sessions: Map<WebSocket, Drafter>;
  draftGroupId: string | undefined;
  game: HydratedGame | undefined;
  #draft: DraftLobby | undefined;
  #logger: AppLoggers;
  isDemo = false;

  // Resolves all instance state in priority order: in-memory → storage → opts.
  // Safe to call with no opts (constructor path): returns early if storage is empty.
  // Safe to call multiple times: skips any field already set in memory.
  private async ensureState(opts?: {
    draftGroupId?: string;
    gameId?: string;
    isDemo?: boolean;
  }): Promise<void> {
    if (isNullish(this.draftGroupId)) {
      const stored = await this.ctx.storage.get<string>(DRAFT_GROUP_ID_KEY);
      if (stored) {
        this.draftGroupId = stored;
      } else if (opts?.draftGroupId) {
        this.draftGroupId = opts.draftGroupId;
        await this.ctx.storage.put(DRAFT_GROUP_ID_KEY, this.draftGroupId);
      }
    }

    if (isNullish(this.isDemo)) {
      const stored = await this.ctx.storage.get<boolean>(IS_DEMO_KEY);
      if (stored) {
        this.isDemo = stored;
      } else if (opts?.isDemo) {
        this.isDemo = true;
        await this.ctx.storage.put(IS_DEMO_KEY, true);
      }
    }

    if (isNullish(this.game)) {
      const stored = await this.ctx.storage.get<HydratedGame>(GAME_KEY);
      if (stored) {
        this.game = stored;
      } else if (opts?.gameId) {
        const dataClient = getDataClient(this.env);
        this.game = await dataClient.games.getOne(opts.gameId);
        await this.ctx.storage.put(GAME_KEY, this.game);
      }
    }

    // * Must have a game to init the lobby; skip if still missing.
    if (isNullish(this.game)) return;

    if (isNullish(this.#draft)) {
      this.#logger.draft.info(
        { gameId: this.game.id, draftGroupId: this.draftGroupId },
        "draft.lobby.initializing",
      );

      const dataClient = getDataClient(this.env);
      const eventFights = await dataClient.events.getFights(this.game.event_id);
      const { fighters } = getGameSelectables(this.game, eventFights);
      const fighterIds = fighters.map((f) => f.id);

      const stored = await this.ctx.storage.get<DraftState>(DRAFT_STATE_KEY);

      if (stored) {
        this.#draft = new DraftLobby({
          kind: "resume",
          state: stored,
          allFighterIds: fighterIds,
        });
        this.#logger.draft.info(
          { gameId: this.game.id, status: stored.status },
          "draft.lobby.resumed",
        );
      } else if (this.game.config.mode.kind === "draft") {
        const draftConfig = {
          draftSize: this.game.config.mode.numPeople,
          numRounds: this.game.config.numPickSlots,
          pickClockSeconds: this.game.config.mode.pickClockSeconds,
        };
        this.#draft = new DraftLobby({ kind: "init", draftConfig, allFighterIds: fighterIds });
        this.#logger.draft.info({ gameId: this.game.id, draftConfig }, "draft.lobby.initialized");
      } else {
        this.#logger.draft.warn(
          { gameId: this.game.id, mode: this.game.config.mode.kind },
          "draft.lobby.mode.unsupported",
        );
      }
    }
  }

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.#logger = createLogger(env);
    this.#logger.lifecycle.info({}, "draft.server.constructed");

    this.sessions = new Map();
    this.ctx.getWebSockets().forEach((ws) => {
      const attachment = ws.deserializeAttachment();
      if (attachment) {
        this.sessions.set(ws, { ...attachment });
      }
    });
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));

    this.ctx.blockConcurrencyWhile(async () => {
      await this.ensureState();

      this.#logger.lifecycle.info(
        {
          draftGroupId: this.draftGroupId,
          gameId: this.game?.id,
          isDemo: this.isDemo,
          activeSessions: this.sessions.size,
        },
        "draft.server.hydrated",
      );

      if (this.#draft) {
        this.#draft.syncUsers(this.sessions.values());
        await this.saveAndBroadcast();
      }
    });

    void this.startDraftLoop();
  }

  async fetch(req: Request): Promise<Response> {
    this.#logger.ws.info({ path: new URL(req.url).pathname }, "draft.server.fetch.received");

    const routeError = DraftProtocol.guardRoute(req, ROUTES.join);
    if (routeError) return routeError;

    const { draftGroupId, gameId, userId, username, isDemo } = DraftProtocol.unpack(req);

    if (isNullish(draftGroupId) || isNullish(gameId) || isNullish(userId)) {
      this.#logger.ws.error({ draftGroupId, gameId, userId }, "draft.server.request.invalid");
      return new Response(
        JSON.stringify({
          message: "Invalid request: draftGroupId, gameId, and userId are required",
        }),
        { status: 400 },
      );
    }

    this.#logger.ws.info({ userId, gameId, draftGroupId }, "draft.server.connection.assigning");

    await this.ctx.blockConcurrencyWhile(async () => {
      await this.ensureState({ draftGroupId, gameId, isDemo });
    });

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    if (isNullish(client) || isNullish(server)) {
      return new Response(JSON.stringify({ message: "Failed to create WebSocket pair" }), {
        status: 500,
      });
    }

    this.ctx.acceptWebSocket(server);

    const drafter = {
      sessionId: uuidv4(),
      userId,
      username,
      picks: [],
    } satisfies Drafter;

    server.serializeAttachment(drafter);
    this.sessions.set(server, drafter);

    if (!this.#draft) {
      // Should not happen if game loaded correctly, unless config is wrong
      return new Response(JSON.stringify({ message: "Draft not initialized" }), { status: 500 });
    }

    // Join the draft
    // Check if user is allowed to join (if locked)
    if (this.#draft.getState().status !== "pending") {
      const state = this.#draft.getState();
      const isParticipant = Array.from(state.users).some((u) => u.userId === drafter.userId);
      if (!isParticipant) {
        return new Response(JSON.stringify({ message: "Draft is locked" }), {
          status: 403,
        });
      }
    }

    server.send(
      JSON.stringify({
        kind: "connection-info",
        payload: { draftGroupId, gameId },
      } satisfies DraftServerMessage),
    );

    this.#draft.syncUsers(this.sessions.values());
    const draftState = await this.saveAndBroadcast();

    this.#logger.ws.info(
      { userId, draftGroupId, status: draftState.status },
      "draft.server.connection.upgraded",
    );
    return DraftProtocol.upgrade(client, draftState.status);
  }

  async getGameId(): Promise<string | undefined> {
    return this.game?.id;
  }

  private async saveAndBroadcast() {
    if (!this.#draft) throw new Error("Draft not initialized");
    const state = this.#draft.getState();

    await this.ctx.storage.put(DRAFT_STATE_KEY, state);
    this.broadcast({ kind: "draft-state", payload: state });
    return state;
  }

  async webSocketMessage(webSocket: WebSocket, message: ArrayBuffer | string) {
    const session = this.sessions.get(webSocket);
    if (isNullish(session)) return;

    try {
      const parsed = draftServerMessageSchema.parse(JSON.parse(String(message)));

      // Handle pick
      // Assuming client sends { kind: "pick-fighter", fighterId: "..." }

      switch (parsed.kind) {
        case "fighter-pick": {
          if (!this.#draft) return;

          this.#logger.ws.info(
            { userId: session.userId, kind: parsed.kind },
            "ws.message.received",
          );
          // TODO: EVERY pick needs to save the draft state to this.ctx.storage
          // TODO: this should only broadcast if the state actually changes
          this.#draft.handlePick(session.userId, parsed.payload);
          await this.saveAndBroadcast();
          break;
        }
      }
    } catch (e) {
      this.#logger.ws.error({ userId: session.userId, error: `${e}` }, "ws.message.failed");

      // Send error to this user
      webSocket.send(
        JSON.stringify({
          kind: "error",
          payload: { message: e instanceof Error ? e.message : "Pick failed" },
        } satisfies DraftServerMessage),
      );
    }
  }

  async webSocketClose(webSocket: WebSocket, code: number, _reason: string, wasClean: boolean) {
    const session = this.sessions.get(webSocket);
    this.sessions.delete(webSocket);

    this.#logger.ws.info({ userId: session?.userId, code, wasClean }, "ws.connection.closed");

    if (session && this.#draft) {
      this.#draft.syncUsers(this.sessions.values());
      await this.saveAndBroadcast();
    }

    if (code === 1005 && wasClean) {
      webSocket.close(1000, "Durable Object is closing WebSocket");
    } else {
      webSocket.close(code, "Durable Object is closing WebSocket");
    }
  }

  async webSocketError(webSocket: WebSocket, _error: unknown) {
    const session = this.sessions.get(webSocket);
    this.sessions.delete(webSocket);

    this.#logger.ws.error({ userId: session?.userId, error: `${_error}` }, "ws.connection.error");

    if (session && this.#draft) {
      this.#draft.syncUsers(this.sessions.values());
      await this.saveAndBroadcast();
    }
  }

  broadcast(message: DraftServerMessage): void {
    const quitters: Drafter[] = [];
    this.sessions.forEach((drafter, webSocket) => {
      try {
        webSocket.send(
          JSON.stringify(message, (_key, value) => (value instanceof Set ? [...value] : value)),
        );
      } catch (_) {
        quitters.push(drafter);
        this.sessions.delete(webSocket);
      }
    });

    this.ctx.blockConcurrencyWhile(async () => {
      if (quitters.length > 0 && this.#draft) {
        this.#draft.syncUsers(this.sessions.values());
        await this.saveAndBroadcast();
      }
    });
  }

  // TODO: see if we can do this without a loop for pending state.
  /**
   * Idempotent draft loop initialization.
   */
  private async startDraftLoop(): Promise<void> {
    while (true) {
      let changed = false;

      await this.ctx.blockConcurrencyWhile(async () => {
        if (!this.#draft) return;

        const state = this.#draft.getState();
        const now = Date.now();

        switch (state.status) {
          case "pending":
            break;
          case "initializing":
            if (state.nextPickAt && now >= state.nextPickAt.getTime()) {
              this.#draft.startDraft();
              changed = true;
            }
            break;
          case "in-progress":
            if (state.nextPickAt && now >= state.nextPickAt.getTime()) {
              this.#draft.autoPick(); // Timeout - auto pick
              changed = true;
            }
            break;
          case "completed": {
            // Demo sessions never write to the database.
            if (this.isDemo) {
              this.#logger.draft.info(
                { draftGroupId: this.draftGroupId },
                "draft.results.skipped.demo",
              );
              break;
            }

            // Flag to ensure we only write results once.
            const saved = await this.ctx.storage.get<boolean>(RESULTS_SAVED_KEY);
            if (!saved) {
              if (!this.game?.id || !this.draftGroupId) {
                throw new Error("Game ID or draft group ID is not set");
              }
              const userIds = Array.from(this.#draft.getState().users).map((u) => u.userId);
              this.#logger.draft.info(
                { gameId: this.game.id, draftGroupId: this.draftGroupId, userIds },
                "draft.results.saving",
              );
              const client = getDataClient(this.env);
              await client.submissions.saveDraft({
                gameId: this.game.id,
                draftGroupId: this.draftGroupId,
                submissions: Array.from(this.#draft.getState().users).map(
                  (user, submissionIndex) => ({
                    user_id: user.userId,
                    metadata: {} satisfies DailyMmaGameSubmissionMetadata,
                    position: submissionIndex + 1,
                    picks: user.picks.map((pick, pickIndex) => ({
                      fighter_id: pick.fighterId,
                      metadata: { kind: "default", order: pickIndex + 1 },
                    })),
                  }),
                ),
              });
              this.#logger.draft.info(
                { gameId: this.game.id, draftGroupId: this.draftGroupId },
                "draft.results.saved",
              );
              await this.ctx.storage.put<boolean>(RESULTS_SAVED_KEY, true);
            }
            break;
          }
        }

        if (changed) {
          await this.saveAndBroadcast();
        }
      });

      // Sleep 1s
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
