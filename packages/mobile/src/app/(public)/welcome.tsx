import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedText from "~/components/ThemedText";
import ThemedView from "~/components/ThemedView";
import { useThemeColors } from "~/hooks/use-theme-colors";

function WelcomePage() {
  const { theme } = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[styles.container, { paddingBottom: insets.bottom + 32, paddingTop: insets.top + 24 }]}
    >
      <View style={styles.hero}>
        <Image
          source={require("../../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.title}>Challenger Fantasy</ThemedText>
        <ThemedText style={styles.subtitle} opacity={60}>
          Draft, compete, win.
        </ThemedText>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => router.push("/email")}
      >
        <ThemedText style={[styles.buttonText, { color: theme.primaryContent }]}>
          Get Started
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 22,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: "center",
  },
  button: {
    width: "100%",
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 18,
  },
});

export default WelcomePage;
