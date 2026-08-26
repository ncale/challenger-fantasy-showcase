import { useEffect, useState } from "react";

/**
 * Provides a ticking countdown in seconds until a given date or time.
 * Returns [secondsRemaining, running, reset].
 */
export function useCountdown(to: Date, enabled: boolean = true): [number, boolean, () => void] {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [to, enabled]);

  const timeRemaining = to.getTime() - now.getTime();
  const secondsRemaining = Math.max(0, Math.floor(timeRemaining / 1000));
  const running = secondsRemaining > 0;

  const reset = () => setNow(new Date());

  return [secondsRemaining, running, reset];
}
