import { PG_ERROR_CODES } from "../data";
import { mapSubmissionToDetailDto } from "../data/models";
import {
  DailyMmaGameSubmissionPickMetadataSchema,
  dailyMmaGameSubmissionBreakdownSchema,
} from "../schemas";
import { OpenAPIHono } from "@hono/zod-openapi";
import { codeInError } from "../lib/api-utils";
import { getDataClient } from "../lib/data";
import { getSupabaseClient } from "../lib/supabase";
import type { Variables } from "../lib/types";
import {
  singleSubmissionRoute,
  submissionDraftGroupRoute,
  updateSubmissionNameRoute,
} from "../routes/submissions";

// TODO: error catch block can be refactored to a common callback function in `@hono/zod-openapi` handler

const v1SubmissionRouter = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>()
  .openapi(singleSubmissionRoute, async (c) => {
    const { id: submissionId } = c.req.valid("param");

    const dataClient = getDataClient(c.env);
    try {
      const [submission, picks] = await Promise.all([
        dataClient.submissions.getOne(submissionId),
        dataClient.submissions.getPicks(submissionId),
      ]);

      return c.json(mapSubmissionToDetailDto(submission, picks), 200);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "Resource not found" }, 404);
        }
      }
      return c.json({ message: `Failed to fetch: ${JSON.stringify(error)}` }, 500);
    }
  })
  .openapi(updateSubmissionNameRoute, async (c) => {
    const { id: submissionId } = c.req.valid("param");
    const { name } = c.req.valid("json");
    const user = c.get("user");

    const supabase = getSupabaseClient(c.env);
    try {
      const { data: existing, error: fetchError } = await supabase
        .schema("public")
        .from("daily_mma_game_submission")
        .select("user_id")
        .eq("id", submissionId)
        .single();

      if (fetchError || !existing) {
        return c.json({ message: "Submission not found" }, 404);
      }
      if (existing.user_id !== user.id) {
        return c.json({ message: "Forbidden" }, 403);
      }

      const dataClient = getDataClient(c.env);
      await dataClient.submissions.updateName(submissionId, user.id, name);
      return c.body(null, 204);
    } catch (error) {
      return c.json({ message: `Failed to update: ${error}` }, 500);
    }
  })
  // TODO: this route is extremely inefficient. Reduce the number of queries and do more processing in SQL instead of in JS.
  .openapi(submissionDraftGroupRoute, async (c) => {
    const { id: submissionId } = c.req.valid("param");
    const dataClient = getDataClient(c.env);

    try {
      const submission = await dataClient.submissions.getOne(submissionId);
      const { draft_group_id: draftGroupId, game_id: gameId, event_id: eventId } = submission;

      const [draftGroupSubmissions, picks, fights, fighters] = await Promise.all([
        dataClient.submissions.getDraftGroupSubmissions(draftGroupId),
        dataClient.submissions.getPicksByGameId(gameId),
        dataClient.events.getFights(eventId),
        dataClient.events.getFighters(eventId),
      ]);

      const fighterNameById: Record<string, string> = Object.fromEntries(
        fighters.map((f) => [f.fighter_id, f.fighter_name ?? ""]),
      );

      const opponentByFighterId = new Map<string, string>();
      const fightIdByFighterId = new Map<string, string>();
      for (const fight of fights) {
        if (fight.fighter_1_id && fight.fighter_2_name) {
          opponentByFighterId.set(fight.fighter_1_id, fight.fighter_2_name);
        }
        if (fight.fighter_2_id && fight.fighter_1_name) {
          opponentByFighterId.set(fight.fighter_2_id, fight.fighter_1_name);
        }
        if (fight.fight_id) {
          if (fight.fighter_1_id) fightIdByFighterId.set(fight.fighter_1_id, fight.fight_id);
          if (fight.fighter_2_id) fightIdByFighterId.set(fight.fighter_2_id, fight.fight_id);
        }
      }

      const picksBySubmissionId = new Map<string, typeof picks>();
      for (const pick of picks) {
        const arr = picksBySubmissionId.get(pick.submission_id) ?? [];
        arr.push(pick);
        picksBySubmissionId.set(pick.submission_id, arr);
      }

      const teams = [...draftGroupSubmissions]
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .map((sub) => {
          if (!sub.id) throw new Error("submission id is null");
          if (!sub.user_id) throw new Error("user_id is null");
          if (!sub.username) throw new Error("username is null");

          const parsedBreakdown = sub.breakdown
            ? dailyMmaGameSubmissionBreakdownSchema.safeParse(sub.breakdown)
            : null;
          const scoreFactors =
            parsedBreakdown?.success && "factors" in parsedBreakdown.data
              ? parsedBreakdown.data.factors
              : [];
          const factorByFighterId = new Map(scoreFactors.map((f) => [f.fighterId, f]));

          const subPicks = picksBySubmissionId.get(sub.id) ?? [];
          const mappedPicks = subPicks
            .map((pick) => {
              const fighterName = fighterNameById[pick.fighter_id];
              if (!fighterName)
                throw new Error(`Missing fighter name for fighter id ${pick.fighter_id}`);

              const opponentName = opponentByFighterId.get(pick.fighter_id);
              if (!opponentName)
                throw new Error(`Missing opponent name for fighter id ${pick.fighter_id}`);

              const fightId = fightIdByFighterId.get(pick.fighter_id);
              if (!fightId) throw new Error(`Missing fight id for fighter id ${pick.fighter_id}`);

              const meta = DailyMmaGameSubmissionPickMetadataSchema.parse(pick.pick_metadata);
              const factor = factorByFighterId.get(pick.fighter_id);
              return {
                fighterId: pick.fighter_id,
                fighterName,
                opponentName,
                fightId,
                score: factor?.effectiveScore ?? null,
                baseScore: factor?.baseScore ?? null,
                potentialScore: factor?.potentialScore ?? null,
                order: meta.order,
              };
            })
            .sort((a, b) => a.order - b.order);

          return {
            submissionId: sub.id,
            userId: sub.user_id,
            username: sub.username,
            avatarUrl: sub.avatar_url,
            score: sub.score ?? 0,
            position: sub.scoring_position,
            picks: mappedPicks,
          };
        });

      return c.json({ id: draftGroupId, teams }, 200);
    } catch (error) {
      if (codeInError(error)) {
        if (error.code === PG_ERROR_CODES.INVALID_INPUT_SYNTAX) {
          return c.json({ message: "Invalid input syntax" }, 400);
        }
      }
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  });

export { v1SubmissionRouter };
