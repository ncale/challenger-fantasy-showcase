import { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { NetworkStatusContext } from "~/contexts/network-status-context";
import { useThemeColors } from "~/hooks/use-theme-colors";
import ThemedText from "./ThemedText";

export function NetworkBanner() {
  const { isOnline } = useContext(NetworkStatusContext);
  const { theme } = useThemeColors();

  if (isOnline) return null;

  return (
    <View style={[styles.banner, { backgroundColor: theme.error }]}>
      <ThemedText style={[styles.text, { color: theme.errorContent }]}>
        No internet connection
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});
