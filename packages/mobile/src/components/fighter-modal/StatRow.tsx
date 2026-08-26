import { Info } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../ThemedText";

type Props = {
  label: string;
  value: string | null | undefined;
  showDivider?: boolean;
  explanation?: string;
};

export function StatRow({ label, value, showDivider = true, explanation }: Props) {
  const { theme } = useAppTheme();
  const [showExplanation, setShowExplanation] = useState(false);

  const inner = (
    <View>
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <ThemedText style={[styles.label, { color: theme.baseContentMuted }]}>{label}</ThemedText>
          {!!explanation && (
            <View style={styles.infoIcon}>
              <Info size={11} color={theme.baseContentExtraMuted} strokeWidth={2} />
            </View>
          )}
        </View>
        <ThemedText style={styles.value}>{value ?? "—"}</ThemedText>
      </View>
      {showExplanation && !!explanation && (
        <View style={styles.explanationContainer}>
          <ThemedText style={[styles.explanation, { color: theme.baseContentMuted }]}>
            {explanation}
          </ThemedText>
        </View>
      )}
      {showDivider && (
        <View style={[styles.divider, { backgroundColor: theme.baseContentExtraMuted }]} />
      )}
    </View>
  );

  if (!explanation) return inner;

  return (
    <Pressable
      onPress={() => setShowExplanation((v) => !v)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  labelContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoIcon: {
    marginTop: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  explanationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  explanation: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 17,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
});
