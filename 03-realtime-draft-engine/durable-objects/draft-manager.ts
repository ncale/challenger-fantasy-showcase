import { DurableObject } from "cloudflare:workers";
import { CF_REGISTRY } from "../data";
import { type AppLoggers, createLogger } from "../logger";
import { isNullish } from "../data/utils";
import { v4 as uuidv4 } from "uuid";
import { DraftProtocol, ROUTES } from "../lib/draft-protocol";

const CURRENT_GROUP_ID_KEY = CF_REGISTRY.draftManagerDO.storage.currentGroupId;

export class DraftManager extends DurableObject {
  private draftGroupId: string | undefined;
  #logger: AppLoggers;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.#logger = createLogger(env);
    this.#logger.lifecycle.info({}, "draft.manager.constructed");

    // !! FYI - You don't need to await blockConcurrencyWhile for this to pause
    // !! execution of the fetch. It will wait until full completion.
    this.ctx.blockConcurrencyWhile(async () => {
      const storedDraftGroupId = await this.ctx.storage.get<string>(CURRENT_GROUP_ID_KEY);
      if (isNullish(storedDraftGroupId)) {
        this.draftGroupId = uuidv4();
        await this.ctx.storage.put(CURRENT_GROUP_ID_KEY, this.draftGroupId);
        this.#logger.lifecycle.info(
          { draftGroupId: this.draftGroupId },
          "draft.manager.group.created",
        );
      } else {
        this.draftGroupId = storedDraftGroupId;
        this.#logger.lifecycle.info({ draftGroupId: this.draftGroupId }, "draft.manager.hydrated");
      }
    });
  }

  async fetch(req: Request): Promise<Response> {
    this.#logger.draft.info({ path: new URL(req.url).pathname }, "draft.manager.fetch.received");

    const routeError = DraftProtocol.guardRoute(req, ROUTES.assign);
    if (routeError) return routeError;

    if (isNullish(this.draftGroupId)) {
      throw new Error("draftGroupId is nullish");
    }

    const { userId, gameId } = DraftProtocol.unpack(req);
    this.#logger.draft.info(
      { draftGroupId: this.draftGroupId, userId, gameId },
      "draft.manager.assigning",
    );

    try {
      const stub = this.env.DRAFT_SERVER.getByName(
        CF_REGISTRY.draftServerDO.getName({ groupId: this.draftGroupId }),
      );

      return await this.ctx.blockConcurrencyWhile(async () => {
        const res = await DraftProtocol.fetch(stub, ROUTES.join, req, {
          draftGroupId: this.draftGroupId,
        });

        const status = DraftProtocol.parseResponseStatus(res);
        if (status === "initializing") {
          const prevGroupId = this.draftGroupId;
          this.draftGroupId = uuidv4();
          await this.ctx.storage.put(CURRENT_GROUP_ID_KEY, this.draftGroupId);
          this.#logger.draft.info(
            { prevGroupId, newGroupId: this.draftGroupId },
            "draft.group.rotated",
          );
        }

        return res;
      });
    } catch (error) {
      this.#logger.draft.error({ error: `${error}` }, "draft.manager.assign.failed");
      if (error instanceof Error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
      }
      return new Response(JSON.stringify({ message: "An unknown error occurred" }), {
        status: 500,
      });
    }
  }
}
