import type { FighterAnalyticsDto } from "@challenger-fantasy/schemas";
import {
  ANALYTICS_FIELD_META,
  type AnalyticsStatKey,
  analyticsToEntries,
} from "@challenger-fantasy/shared";
import type { CarouselStat } from "~/components/fighter";

export function fighterAnalyticsToCarouselStats(
  analytics: FighterAnalyticsDto | undefined,
  onStatPress?: (key: AnalyticsStatKey) => void,
): CarouselStat[] {
  if (!analytics) return [];
  const { fighterId: _, ...statsOnly } = analytics;
  return analyticsToEntries(statsOnly)
    .filter((e): e is typeof e & { value: string } => e.value !== null)
    .map(({ key, abbr, value }) => {
      const isPct = ANALYTICS_FIELD_META[key].format === "pct";
      return {
        label: isPct ? `${abbr} %` : abbr,
        value: isPct ? value.replace("%", "") : value,
        onPress: onStatPress ? () => onStatPress(key) : undefined,
      };
    });
}
