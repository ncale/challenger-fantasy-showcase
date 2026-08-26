import type { DraftState } from "@challenger-fantasy/schemas";
import { useCountdown } from "./use-countdown";

export function useDraftClock(draftState: DraftState | null): {
  secondsRemaining: number;
  isCounting: boolean;
} {
  const nextPickAt = draftState?.nextPickAt;
  const isCounting = !!nextPickAt;
  const [secondsRemaining] = useCountdown(nextPickAt ?? new Date(0), isCounting);
  return { secondsRemaining, isCounting };
}
