import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "./ThemedText";

type SortMode = "fights" | "prob_desc" | "points_desc" | "ranking";

const SORT_LABELS: Record<SortMode, string> = {
  fights: "Fight Order",
  prob_desc: "Win Prob",
  points_desc: "Points",
  ranking: "My Rank",
};

type PillProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function Pill({ label, active, onPress }: PillProps) {
  const { theme } = useAppTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[
        styles.pill,
        {
          borderColor: active ? theme.baseContent : theme.baseContentMuted,
          backgroundColor: active ? theme.baseContent : "transparent",
        },
      ]}
    >
      <ThemedText
        style={[styles.pillText, { color: active ? theme.base100 : theme.baseContentMuted }]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

type SortPillsProps = {
  value: SortMode;
  onChange: (v: SortMode) => void;
  options: SortMode[];
  backgroundColor?: string;
};

export function SortPills({ value, onChange, options, backgroundColor }: SortPillsProps) {
  return (
    <View style={[styles.row, backgroundColor != null && { backgroundColor }]}>
      {options.map((opt) => (
        <Pill
          key={opt}
          label={SORT_LABELS[opt]}
          active={value === opt}
          onPress={() => onChange(opt)}
        />
      ))}
    </View>
  );
}

export function useSortPills(options: SortMode[], defaultValue?: SortMode): SortPillsProps {
  const [value, onChange] = useState<SortMode>(defaultValue ?? options[0] ?? "fights");
  return { value, onChange, options };
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pill: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
