import { z } from "zod";

const draftPickSchema = z.object({
  fighterId: z.string(),
  pickedAt: z.coerce.date(),
});

const drafterSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  username: z.string().optional(),
  picks: z.array(draftPickSchema),
});
export type Drafter = z.infer<typeof drafterSchema>;

const draftConfig = z.object({
  draftSize: z.number(),
  numRounds: z.number(),
  pickClockSeconds: z.number(),
});
export type DraftConfig = z.infer<typeof draftConfig>;

export const draftStateSchema = z.union([
  z.object({
    users: z.set(drafterSchema),
    draftConfig: draftConfig,
    status: z.enum(["pending"]),
    nextPickAt: z.undefined(),
  }),
  z.object({
    users: z.set(drafterSchema),
    draftConfig: draftConfig,
    status: z.enum(["initializing"]),
    pickOrder: z.array(z.string()),
    nextPickAt: z.coerce.date(),
  }),
  z.object({
    users: z.set(drafterSchema),
    draftConfig: draftConfig,
    status: z.enum(["in-progress"]),
    pickOrder: z.array(z.string()),
    currentRound: z.number(),
    currentPickerId: z.string(),
    nextPickAt: z.coerce.date(),
  }),
  z.object({
    users: z.set(drafterSchema),
    draftConfig: draftConfig,
    status: z.enum(["completed"]),
    pickOrder: z.array(z.string()),
    nextPickAt: z.undefined(),
  }),
]);
export type DraftState = z.infer<typeof draftStateSchema>;
export type DraftStateStatus = DraftState["status"];

export const fighterPickSchema = z.object({ fighterId: z.string(), timestamp: z.number() });
export type FighterPick = z.infer<typeof fighterPickSchema>;

export const draftServerMessageSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("connection-info"),
    payload: z.object({ draftGroupId: z.string(), gameId: z.string() }),
  }),
  z.object({
    kind: z.literal("draft-state"),
    payload: draftStateSchema,
  }),
  z.object({
    kind: z.literal("message"),
    payload: z.object({ id: z.string(), message: z.string() }),
  }),
  z.object({
    kind: z.literal("fighter-pick"),
    payload: fighterPickSchema,
  }),
  z.object({
    kind: z.literal("error"),
    payload: z.object({ message: z.string() }),
  }),
]);
export type DraftServerMessage = z.infer<typeof draftServerMessageSchema>;
