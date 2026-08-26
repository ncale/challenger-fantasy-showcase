import { StyleSheet } from "react-native";
import ThemedText from "../ThemedText";
import ThemedView from "../ThemedView";

const LeaderboardTab = () => (
  <ThemedView style={styles.tabContent}>
    <ThemedText style={styles.tabText}>Leaderboard Tab (mocked)</ThemedText>
  </ThemedView>
);

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 18,
    fontWeight: "500",
  },
});

export { LeaderboardTab };
