import { StyleSheet, View } from "react-native";
import ThemedText from "~/components/ThemedText";
import { useThemeColors } from "~/hooks/use-theme-colors";

export function SectionLabel({ title, paddingTop = 16 }: { title: string; paddingTop?: number }) {
  const { theme } = useThemeColors();

  return (
    <View style={[styles.container, { paddingTop }]}>
      <ThemedText style={[styles.label, { color: theme.baseContentMuted }]}>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
