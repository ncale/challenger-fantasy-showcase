import { ActivityIndicator, StyleSheet } from "react-native";
import ThemedView from "~/components/ThemedView";
import { useThemeColors } from "~/hooks/use-theme-colors";

export function TabFallback() {
  const { theme } = useThemeColors();
  return (
    <ThemedView style={styles.tabFallback}>
      <ActivityIndicator color={theme.baseContent} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tabFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
