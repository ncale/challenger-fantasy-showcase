import { PG_ERROR_CODES } from "../data";
import { mapSubmissionToDto } from "../data/models";
import type { UserProfileDto } from "../schemas";
import { OpenAPIHono } from "@hono/zod-openapi";
import { codeInError } from "../lib/api-utils";
import {
  getDataClient,
  getUserSubmissionEventRepository,
  getUserSubmissionRepository,
} from "../lib/data";
import { getSupabaseClient } from "../lib/supabase";
import type { Variables } from "../lib/types";
import { mapUserSubmissionToDto } from "../mappers/user-submission.dto.mapper";
import { mapUserSubmissionEventToDto } from "../mappers/user-submission-event.dto.mapper";
import {
  deleteMyAccountRoute,
  getPickRankingRoute,
  upsertPickRankingRoute,
  userProfileRoute,
  userProfileSnakeCaseRoute,
  userStatsRoute,
  userSubmissionCountsRoute,
  userSubmissionEventsRoute,
  userSubmissionsGroupedRoute,
  userSubmissionsRoute,
} from "../routes/user.routes";

// TODO: error catch block can be refactored to a common callback function in `@hono/zod-openapi` handler

const v1UserRouter = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>()
  .openapi(userProfileRoute, async (c) => {
    const { id } = c.req.valid("param");

    const dataClient = getDataClient(c.env);
    try {
      const user = await dataClient.users.getProfile(id);
      const dto = {
        userId: user.user_id,
        username: user.username,
        avatarUrl: user.avatar_url,
        updatedAt: user.updated_at,
        since: user.since,
      } satisfies UserProfileDto;
      return c.json(dto, 200);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "Resource not found" }, 404);
        }
      }

      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  // ! DEPRECATED - use userProfileRoute instead. This is only here for backward compatibility with existing clients.
  .openapi(userProfileSnakeCaseRoute, async (c) => {
    const { id } = c.req.valid("param");
    const dataClient = getDataClient(c.env);
    try {
      const user = await dataClient.users.getProfile(id);
      return c.json(user, 200);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "Resource not found" }, 404);
        }
      }
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(deleteMyAccountRoute, async (c) => {
    const user = c.get("user");
    const supabase = getSupabaseClient(c.env);

    // TODO: put all of this into a single transaction or stored procedure to avoid partial deletes.

    const { error: anonymizeError } = await supabase
      .schema("public")
      .from("user_profile")
      .update({
        username: `deleted_${user.id.slice(0, 8)}`, // keep a stable placeholder
        avatar_url: null,
      })
      .eq("user_id", user.id);
    if (anonymizeError) {
      return c.json({ message: `Failed to anonymize profile: ${anonymizeError.message}` }, 500);
    }

    const { error: setDeletedError } = await supabase
      .schema("public")
      .from("users")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
    if (setDeletedError) {
      return c.json(
        { message: `Failed to set account as deleted: ${setDeletedError.message}` },
        500,
      );
    }

    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      return c.json({ message: `Failed to delete account: ${error.message}` }, 500);
    }
    return c.body(null, 204);
  })
  .openapi(userSubmissionCountsRoute, async (c) => {
    const { id } = c.req.valid("param");

    const dataClient = getDataClient(c.env);
    try {
      // TODO: this should just get submission counts with SQL COUNT(*)
      const submissions = await dataClient.users.getSubmissions(id);

      // TODO: use the same logic that is used in the backend parser
      const completed = submissions.filter((s) => s.event_status === "final").length;
      const live = submissions.filter((s) => s.event_status === "live").length;
      const upcoming = submissions.filter((s) => s.event_status === "scheduled").length;

      return c.json({ live, upcoming, completed }, 200);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "Resource not found" }, 404);
        }
      }
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(userStatsRoute, async (c) => {
    const { id } = c.req.valid("param");
    const dataClient = getDataClient(c.env);
    try {
      const stats = await dataClient.users.getStats(id);
      return c.json(stats, 200);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "Resource not found" }, 404);
        }
      }
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(userSubmissionsRoute, async (c) => {
    const { id } = c.req.valid("param");
    const { status, pageSize, page, eventId } = c.req.valid("query");

    const repo = getUserSubmissionRepository(c.env);
    try {
      const submissions = await repo.getByUserId(id, { status, pageSize, page, eventId });
      return c.json({ submissions: submissions.map(mapUserSubmissionToDto) }, 200);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "Resource not found" }, 404);
        }
      }
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(userSubmissionsGroupedRoute, async (c) => {
    const { id } = c.req.valid("param");
    const { status, pageSize, page } = c.req.valid("query");
    const options = { page, pageSize };

    const dataClient = getDataClient(c.env);
    try {
      let hydratedSubmissions: Awaited<ReturnType<typeof dataClient.users.getLiveSubmissions>>;
      switch (status) {
        case "live":
          hydratedSubmissions = await dataClient.users.getLiveSubmissions(id, options);
          break;
        case "upcoming":
          hydratedSubmissions = await dataClient.users.getUpcomingSubmissions(id, options);
          break;
        case "completed":
          hydratedSubmissions = await dataClient.users.getCompletedSubmissions(id, options);
          break;
        default:
          return c.json({ message: "Invalid status" }, 400);
      }

      const groupMap = new Map<
        string,
        {
          event: { id: string; name: string };
          submissions: ReturnType<typeof mapSubmissionToDto>[];
        }
      >();
      for (const sub of hydratedSubmissions) {
        const dto = mapSubmissionToDto(sub);
        if (!dto.event) continue;
        const existing = groupMap.get(dto.event.id);
        if (existing) {
          existing.submissions.push(dto);
        } else {
          groupMap.set(dto.event.id, { event: dto.event, submissions: [dto] });
        }
      }

      const groups = [...groupMap.values()].map((group) => ({
        ...group,
        submissions: group.submissions,
      }));

      return c.json({ groups }, 200);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "Resource not found" }, 404);
        }
      }
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(userSubmissionEventsRoute, async (c) => {
    const { id } = c.req.valid("param");
    const { status, page = 0, pageSize = 10 } = c.req.valid("query");
    const repo = getUserSubmissionEventRepository(c.env);
    try {
      const { items, total } = await repo.getByUserId(id, { status, page, pageSize });
      return c.json(
        { submissionEvents: items.map(mapUserSubmissionEventToDto), total, page, pageSize },
        200,
      );
    } catch (error) {
      if (codeInError(error)) {
        if (error.code === PG_ERROR_CODES.INVALID_INPUT_SYNTAX) {
          return c.json({ message: "Invalid input syntax" }, 400);
        }
      }
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(getPickRankingRoute, async (c) => {
    const { eventId } = c.req.valid("query");
    const user = c.get("user");

    const dataClient = getDataClient(c.env);
    try {
      const result = await dataClient.users.getPickRanking(user.id, eventId);
      if (!result) return c.json(null, 200);
      return c.json({ eventId, fighterIds: result.fighterIds }, 200);
    } catch (error) {
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(upsertPickRankingRoute, async (c) => {
    const { eventId, fighterIds } = c.req.valid("json");
    const user = c.get("user");

    const dataClient = getDataClient(c.env);
    try {
      const result = await dataClient.users.upsertPickRanking(user.id, eventId, fighterIds);
      return c.json({ eventId, fighterIds: result.fighterIds }, 200);
    } catch (error) {
      return c.json({ message: `Failed to upsert: ${error}` }, 500);
    }
  });

export { v1UserRouter };
