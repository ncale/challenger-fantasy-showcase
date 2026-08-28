export const ANALYTICS_LOOKBACK_YEARS = 5;
export const SECONDS_PER_FULL_ROUND = 300;

export function roundTimeToSeconds(roundTime: string): number {
  const [min, sec] = roundTime.split(":");
  return Number(min) * 60 + Number(sec);
}
