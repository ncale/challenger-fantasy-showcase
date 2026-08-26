import { StyleSheet, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../ThemedText";

type Props = {
  label: string;
  value: number | null | undefined;
  displayValue?: string;
  textAlign?: "left" | "center" | "right";
};

export function StatBadge({ label, value, displayValue, textAlign = "center" }: Props) {
  const { theme } = useAppTheme();
  const display = displayValue ?? (value != null ? `${Math.round(value * 100)}%` : "-%");
  const align = textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center";
  return (
    <View style={[styles.container, { alignItems: align }]}>
      <ThemedText style={[styles.label, { color: theme.baseContentMuted }]}>{label}</ThemedText>
      <ThemedText style={[styles.value, { color: theme.baseContentMuted }]}>{display}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    minWidth: 42,
  },
  label: {
    fontSize: 8,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 11,
    fontWeight: "700",
  },
});
