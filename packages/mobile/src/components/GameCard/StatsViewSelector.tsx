import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { ChevronDown } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../ThemedText";

export type StatsView = "5year";

export const STATS_VIEW_LABELS: Record<StatsView, string> = {
  "5year": "Past 5 Years",
};

type StatsViewSelectorProps = {
  onViewChange?: (view: StatsView) => void;
};

export function StatsViewSelector({ onViewChange }: StatsViewSelectorProps) {
  const { theme } = useAppTheme();
  const [statsView, setStatsView] = useState<StatsView>("5year");
  const sheetRef = useRef<BottomSheetModal>(null);

  const handleSelect = useCallback(
    (view: StatsView) => {
      setStatsView(view);
      onViewChange?.(view);
      sheetRef.current?.dismiss();
    },
    [onViewChange],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.52} />
    ),
    [],
  );

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => sheetRef.current?.present()}
        style={styles.button}
      >
        <ThemedText style={[styles.label, { color: theme.accent }]}>
          {STATS_VIEW_LABELS[statsView]}
        </ThemedText>
        <ChevronDown size={14} color={theme.accent} strokeWidth={3.5} />
      </TouchableOpacity>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["30%"]}
        enablePanDownToClose
        enableDynamicSizing={false}
        enableOverDrag={false}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.base200 }}
      >
        <View style={styles.sheetContent}>
          <ThemedText style={[styles.sheetTitle, { color: theme.baseContentMuted }]}>
            Stats View
          </ThemedText>
          {(Object.keys(STATS_VIEW_LABELS) as StatsView[]).map((view) => (
            <TouchableOpacity
              key={view}
              activeOpacity={1}
              onPress={() => handleSelect(view)}
              style={[styles.option, statsView === view && { backgroundColor: theme.base300 }]}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  statsView === view && { color: theme.baseContent, fontWeight: "700" },
                ]}
              >
                {STATS_VIEW_LABELS[view]}
              </ThemedText>
              {statsView === view && (
                <ThemedText style={{ color: theme.baseContent }}>✓</ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 4,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
