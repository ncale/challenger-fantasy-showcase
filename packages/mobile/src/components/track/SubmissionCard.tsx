import { formatCountdown, formatOrdinal } from "@challenger-fantasy/core";
import type { SubmissionDto } from "@challenger-fantasy/schemas";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ChevronRight, Trophy } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCountdown } from "~/hooks/use-countdown";
import { singleEventQuery } from "~/lib/init-queries";
import { useAppTheme } from "~/providers/app-theme-provider";

function CountdownPill({ startTime }: { startTime: string }) {
  const { theme } = useAppTheme();
  const date = useMemo(() => new Date(startTime), [startTime]);
  const [seconds] = useCountdown(date);

  return (
    <View style={[styles.pill, { backgroundColor: `${theme.warning}22` }]}>
      <View style={[styles.pillDot, { backgroundColor: theme.warning }]} />
      <Text style={[styles.pillText, { color: theme.warning, fontVariant: ["tabular-nums"] }]}>
        {formatCountdown(seconds)}
      </Text>
    </View>
  );
}

export function SubmissionCard({ submission }: { submission: SubmissionDto }) {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { data: event } = useQuery(singleEventQuery(submission.event?.id));

  if (!submission.game || !submission.event) throw new Error("Fix me");

  const status = event?.status;
  const score = submission.scoring.score;
  const position = submission.scoring.position;

  const hasPosition = position != null && position > 0;
  const showPill = status === "scheduled" && !!event?.startTimeUtc;
  const showScore = (status === "live" && score > 0) || (status === "final" && score > 0);

  return (
    <Pressable
      onPress={() => router.push(`/submissions/${submission.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: theme.baseContentExtraMuted,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`View submission ${submission.name ?? "Submission"}`}
    >
      {/* Place column */}
      <View style={styles.placeCol}>
        {hasPosition ? (
          position === 1 ? (
            <Trophy size={22} color="#fbbf24" />
          ) : (
            <Text style={[styles.placeText, { color: theme.baseContent }]}>
              {formatOrdinal(position)}
            </Text>
          )
        ) : (
          <Text style={[styles.placeDash, { color: theme.baseContentExtraMuted }]}>—</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.contentCol}>
        <Text style={[styles.primary, { color: theme.baseContent }]} numberOfLines={1}>
          {submission.name ?? "Submission"}
        </Text>
        <Text style={[styles.secondary, { color: theme.baseContentMuted }]} numberOfLines={1}>
          {submission.game.name}
        </Text>
      </View>

      {/* Right: score / countdown + chevron */}
      <View style={styles.rightCol}>
        {showPill ? (
          <CountdownPill startTime={event?.startTimeUtc ?? ""} />
        ) : showScore ? (
          <Text style={[styles.scoreText, { color: theme.baseContent }]}>{score} pts</Text>
        ) : null}
        <ChevronRight size={16} strokeWidth={2} color={theme.baseContentMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
  },
  placeCol: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 3,
  },
  placeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  placeDash: {
    fontSize: 14,
  },
  contentCol: {
    flex: 1,
    justifyContent: "center",
    gap: 3,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  primary: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  secondary: {
    fontSize: 12,
    fontWeight: "500",
  },
  rightCol: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 6,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
