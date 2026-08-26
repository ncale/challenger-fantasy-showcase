import { Wrench } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedText from "~/components/ThemedText";
import ThemedView from "~/components/ThemedView";
import { useThemeColors } from "~/hooks/use-theme-colors";

export function MaintenanceScreen() {
  const { theme } = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.base300 }]}>
        <Wrench size={40} color={theme.primary} strokeWidth={1.5} />
      </View>
      <ThemedText style={styles.title}>Down for maintenance</ThemedText>
      <ThemedText style={[styles.body, { color: theme.baseContentMuted }]}>
        We're making some improvements and apologize for the inconvenience. Please check back later.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 20,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
