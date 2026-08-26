import type { DraftState } from "@challenger-fantasy/schemas";

// Returns how many picks stand between the current picker and userId's next turn.
// Returns null if it can't be determined (user not in order, etc.).
function picksUntilMyTurn(
  state: Extract<DraftState, { status: "in-progress" }>,
  userId: string,
): number | null {
  const { pickOrder, currentPickerId, currentRound, draftConfig } = state;
  const { draftSize } = draftConfig;

  if (currentPickerId === userId) return 0;

  const roundIndex = currentRound - 1; // 0-based
  const isForward = roundIndex % 2 === 0;
  const currentRoundOrder = isForward ? pickOrder : [...pickOrder].reverse();

  const currentPos = currentRoundOrder.indexOf(currentPickerId);
  const userPos = currentRoundOrder.indexOf(userId);

  if (currentPos === -1 || userPos === -1) return null;

  // User still picks later this round
  if (userPos > currentPos) return userPos - currentPos;

  // User already picked this round — find their slot in the next round
  const nextRoundOrder = isForward ? [...pickOrder].reverse() : pickOrder;
  const userNextPos = nextRoundOrder.indexOf(userId);
  if (userNextPos === -1) return null;

  return draftSize - currentPos - 1 + userNextPos + 1;
}

export function getDraftStatusLabel(
  draftState: DraftState | null,
  currentUserId: string | null | undefined,
): string | null {
  if (!draftState) return "Connecting...";

  switch (draftState.status) {
    case "pending": {
      const waiting = draftState.draftConfig.draftSize - draftState.users.size;
      return `Waiting for ${waiting} more`;
    }
    case "initializing":
      return "Draft starting";
    case "completed":
      return null;
    case "in-progress": {
      if (draftState.currentPickerId === currentUserId) return "Your turn";
      if (currentUserId) {
        const myDrafter = Array.from(draftState.users).find((d) => d.userId === currentUserId);
        if (myDrafter && myDrafter.picks.length >= draftState.draftConfig.numRounds) {
          return "Waiting for others";
        }
        const count = picksUntilMyTurn(draftState, currentUserId);
        if (count !== null && count > 0) return `${count} pick${count === 1 ? "" : "s"} away`;
      }
      return "In progress";
    }
  }
}
