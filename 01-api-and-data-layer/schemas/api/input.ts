import { z } from "@hono/zod-openapi";

// DO NOT EXPORT

const paginationSchema = z.object({
  page: z.coerce.number().int().min(0).optional().openapi({ description: "Page number" }),
  pageSize: z.coerce.number().int().min(0).optional().openapi({ description: "Page size" }),
});

const timestampSchema = z.object({
  timestamp: z.coerce
    .number()
    .int()
    .nullish()
    .openapi({ description: "Ignored. Use to bust cache" }),
});

const accessTokenSchema = z.object({
  accessToken: z.string().min(1).nullish(),
});

// PATH PARAMS

export const idRequestParamsSchema = z
  .object({
    id: z.uuid().openapi({ param: { name: "id", in: "path" } }),
  })
  .openapi("idRequestParamsSchema");

export const idOrSlugRequestParamsSchema = z
  .object({
    idOrSlug: z
      .union([z.uuid(), z.string().min(1)])
      .openapi({ param: { name: "idOrSlug", in: "path" } }),
  })
  .openapi("idOrSlugRequestParamsSchema");

// QUERY PARAMS

export const userSubmissionCountsQueryParamsSchema = z
  .object({
    ...timestampSchema.shape,
  })
  .openapi("userSubmissionCountsQueryParamsSchema");

export const singleSubmissionQueryParamsSchema = z
  .object({ ...timestampSchema.shape })
  .openapi("singleSubmissionQueryParamsSchema");

export const submissionDraftGroupQueryParamsSchema = z
  .object({ ...timestampSchema.shape })
  .openapi("submissionDraftGroupQueryParamsSchema");

export const userSubmissionsQueryParamsSchema = z
  .object({
    // TODO: combine with ../../types common.ts SubmissionStatusOptions type
    status: z.enum(["live", "upcoming", "completed"]).optional(),
    eventId: z.uuid().optional(),
    ...paginationSchema.shape,
    ...timestampSchema.shape,
  })
  .openapi("userSubmissionsQueryParamsSchema");

export const allGameSubmissionCountsRequestParamsSchema = z.object({
  status: z.enum(["scheduled-or-live", "final"]).optional().openapi({
    description: "Filter by event status. Allowed values: scheduled, live, final.",
  }),
});

export const eventsListQueryParamsSchema = z
  .object({
    status: z.enum(["upcoming", "past", "upcoming-or-live"]).optional().openapi({
      description:
        "Filter events by status. Upcoming = scheduled, Past = final, upcoming-or-live = scheduled or live (live sorted first)",
    }),
    ...paginationSchema.shape,
    ...timestampSchema.shape,
  })
  .openapi("eventsListQueryParamsSchema");

export const eventsCardQueryParamsSchema = z
  .object({
    top: z.coerce.number().int().nullish().openapi({
      description: "Filter fighters by top fights and fighters",
    }),
    ...timestampSchema.shape,
  })
  .openapi("eventsCardQueryParamsSchema");

export const singleGameQueryParamsSchema = z
  .object({
    ...timestampSchema.shape,
  })
  .openapi("singleGameQueryParamsSchema");

export const joinGameQueryParamsSchema = z.object({
  ...accessTokenSchema.shape,
});

export const joinDraftQueryParamsSchema = z
  .object({
    ...accessTokenSchema.shape,
    gameId: z.string().optional(),
    draftGroupId: z.string().optional(),
  })
  .refine(
    (data) => {
      // * Check for "Exclusive Or" (XOR): One must exist, but not both.
      const hasGameId = !!data.gameId;
      const hasDraftGroupId = !!data.draftGroupId;
      return (hasGameId || hasDraftGroupId) && !(hasGameId && hasDraftGroupId);
    },
    {
      message: "Must provide either gameId or draftGroupId, but not both",
      path: ["gameId"], // Point the error to a relevant field
    },
  );

// Fighters query params
export const fightersQueryParamsSchema = z
  .object({
    kind: z.enum(["popular"]).optional().openapi({ description: "Kind of fighters to fetch" }),
  })
  .openapi("fightersQueryParamsSchema");

export const fighterIdRequestParamsSchema = z
  .object({
    fighterId: z.uuid().openapi({ param: { name: "fighterId", in: "path" } }),
  })
  .openapi("fighterIdRequestParamsSchema");

export const fighterScoringQueryParamsSchema = z
  .object({
    // TODO: this should be an ENUM
    scoringProfile: z.string().min(1).openapi({ description: "Scoring profile key" }),
    fightId: z.uuid().openapi({ description: "Fight ID" }),
  })
  .openapi("fighterScoringQueryParamsSchema");

// TODO: integrate with the submission metadata JSONB schema somehow
export const updateSubmissionNameBodySchema = z
  .object({
    name: z.string().min(1).max(100).nullable(),
  })
  .openapi("updateSubmissionNameBody");

export const pickRankingQueryParamsSchema = z
  .object({
    eventId: z.uuid().openapi({ description: "Event ID to fetch ranking for" }),
  })
  .openapi("pickRankingQueryParams");

export const upsertPickRankingBodySchema = z
  .object({
    eventId: z.uuid(),
    fighterIds: z.array(z.uuid()).openapi({ description: "Ordered fighter IDs; index = position" }),
  })
  .openapi("upsertPickRankingBody");

export const userSubmissionEventsQueryParamsSchema = z
  .object({
    status: z.enum(["live", "upcoming", "completed"]),
    ...paginationSchema.shape,
    ...timestampSchema.shape,
  })
  .openapi("userSubmissionEventsQueryParamsSchema");
