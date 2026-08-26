import {
  ANALYTICS_FIELD_META,
  type AnalyticsStatKey,
  FIGHTER_CONTEXT_FIELD_META,
  type FighterContextStatKey,
} from "@challenger-fantasy/shared";
import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../ThemedText";
import type { AnalyticsSortState, SortKey } from "./use-analytic-sort";

function getSortAbbr(key: SortKey): string {
  if (key in ANALYTICS_FIELD_META) {
    return ANALYTICS_FIELD_META[key as AnalyticsStatKey].abbr;
  }
  return FIGHTER_CONTEXT_FIELD_META[key as FighterContextStatKey].abbr;
}

type ActiveSortPillProps = {
  sort: AnalyticsSortState;
  onClear: () => void;
};

export function ActiveSortPill({ sort, onClear }: ActiveSortPillProps) {
  const { theme } = useAppTheme();

  if (!sort) return null;

  const arrow = sort.direction === "desc" ? "↓" : "↑";

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClear();
  };

  return (
    <TouchableOpacity
      onPress={handleClear}
      activeOpacity={1}
      style={[
        styles.pill,
        { borderColor: `${theme.baseContent}20`, backgroundColor: `${theme.baseContent}10` },
      ]}
    >
      <View style={styles.labelCol}>
        <ThemedText style={[styles.sortingBy, { color: theme.baseContentMuted }]}>
          Sorting by
        </ThemedText>
        <ThemedText style={[styles.text, { color: theme.baseContent }]}>
          {getSortAbbr(sort.key)} {arrow}
        </ThemedText>
      </View>
      <X size={15} strokeWidth={2.5} color={theme.baseContentMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  labelCol: {
    gap: 1,
  },
  sortingBy: {
    fontSize: 7,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
  },
});
