import { errorResponseDtoSchema, idRequestParamsSchema } from "../schemas";
import { createRoute } from "@hono/zod-openapi";

export const draftGroupRoute = createRoute({
  method: "get",
  path: "/draft-groups/:id",
  request: { params: idRequestParamsSchema },
  responses: {
    501: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Not Implemented",
    },
  },
});

// export const draftGroupRoute = createRoute({
//   method: "get",
//   path: "/draft-groups/:id",
//   request: { params: idRequestParamsSchema },
//   middleware: [httpCache(1800)],
//   responses: {
//     200: {
//       content: { "application/json": { schema: draftGroupDtoSchema } },
//       description: "Resource fetched successfully",
//     },
//     400: {
//       content: { "application/json": { schema: errorResponseDtoSchema } },
//       description: "Invalid input syntax",
//     },
//     404: {
//       content: { "application/json": { schema: errorResponseDtoSchema } },
//       description: "Draft group not found",
//     },
//     500: {
//       content: { "application/json": { schema: errorResponseDtoSchema } },
//       description: "Server Error",
//     },
//   },
// });
