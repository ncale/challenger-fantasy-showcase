/**
 * Demo draft utilities shared across platforms (web, mobile).
 * Pure logic only — no framework dependencies.
 */

export const DEMO_USER_ID = "demo-user-self";

export const DEMO_PLAYERS = [
  { userId: DEMO_USER_ID, username: "You", isBot: false, sessionId: "demo-s-0" },
  { userId: "demo-bot-1", username: "Dustin P.", isBot: true, sessionId: "demo-s-1" },
  { userId: "demo-bot-2", username: "Alex V.", isBot: true, sessionId: "demo-s-2" },
] satisfies ReadonlyArray<{
  userId: string;
  username: string;
  isBot: boolean;
  sessionId: string;
}>;

export type DemoPlayer = (typeof DEMO_PLAYERS)[number];

export const DEMO_DRAFT_CONFIG = {
  draftSize: 3,
  numRounds: 3,
  pickClockSeconds: 20,
} as const;

/**
 * Returns the userId who picks at a given 0-indexed pick slot using a snake draft.
 * Round 0 (odd): pickOrder[0], [1], [2]
 * Round 1 (even): pickOrder[2], [1], [0]  ← reversed
 */
export function getDemoPickerAtIndex(
  pickOrder: readonly string[],
  draftSize: number,
  pickIndex: number,
): string {
  const round = Math.floor(pickIndex / draftSize);
  const slotWithinRound = pickIndex % draftSize;
  const idx = round % 2 === 0 ? slotWithinRound : draftSize - 1 - slotWithinRound;
  const userId = pickOrder[idx];
  if (userId === undefined) throw new Error(`No picker at index ${pickIndex}`);
  return userId;
}
