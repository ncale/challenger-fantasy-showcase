import type { UserSubmissionEventDto } from "@challenger-fantasy/schemas";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";

export function EventSubmissionCard({ event, submissionCount }: UserSubmissionEventDto) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      style={[styles.row, { borderBottomColor: theme.base300 }]}
      onPress={() => router.push(`/(protected)/(tabs)/(track)/events/${event.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${event.headlineName} — ${submissionCount} ${submissionCount === 1 ? "entry" : "entries"}`}
    >
      <View style={styles.nameCol}>
        <Text style={[styles.series, { color: theme.baseContentMuted }]} numberOfLines={1}>
          {event.seriesName}
        </Text>
        <Text style={[styles.headline, { color: theme.baseContent }]} numberOfLines={1}>
          {event.headlineName}
        </Text>
      </View>
      <View style={styles.entriesCol}>
        <Text style={[styles.entriesText, { color: theme.baseContentMuted }]}>
          {submissionCount} {submissionCount === 1 ? "entry" : "entries"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  nameCol: {
    flex: 1,
    gap: 3,
  },
  series: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  entriesCol: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  entriesText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
