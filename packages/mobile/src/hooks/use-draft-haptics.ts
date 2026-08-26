import type { DraftState } from "@challenger-fantasy/schemas";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { useCountdown } from "./use-countdown";

export function useDraftHaptics(draftState: DraftState | null, userId: string | undefined) {
  const isInProgress = draftState?.status === "in-progress";
  const currentPickerId = isInProgress ? draftState.currentPickerId : null;
  const nextPickAt = isInProgress ? draftState.nextPickAt : null;

  const isMyTurn = isInProgress && currentPickerId === userId;
  const prevIsMyTurnRef = useRef(false);

  useEffect(() => {
    if (isMyTurn && !prevIsMyTurnRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 600);
    }
    prevIsMyTurnRef.current = isMyTurn;
  }, [isMyTurn]);

  const [secondsRemaining] = useCountdown(nextPickAt ?? new Date(0), isInProgress);

  useEffect(() => {
    if (secondsRemaining >= 1 && secondsRemaining <= 10) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [secondsRemaining]);
}
