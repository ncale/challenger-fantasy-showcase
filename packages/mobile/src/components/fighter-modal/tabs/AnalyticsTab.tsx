import {
  ANALYTICS_DIFFERENTIAL_EXPLANATIONS,
  computeAnalyticsDifferential,
  formatAnalyticsDifferential,
  formatAnalyticsValue,
  getAnalyticsExplanation,
  getAnalyticsLabel,
} from "@challenger-fantasy/shared";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, View } from "react-native";
import { singleFighterAnalyticsQuery } from "~/lib/init-queries";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../../ThemedText";
import { StatSection } from "../StatSection";

type Props = {
  fighterId: string;
};

export function AnalyticsTab({ fighterId }: Props) {
  const { theme } = useAppTheme();
  const { data: analytics, isLoading } = useQuery(singleFighterAnalyticsQuery(fighterId));

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <ThemedText style={[styles.placeholderText, { color: theme.baseContentMuted }]}>
          Loading…
        </ThemedText>
      </View>
    );
  }

  const striking = [
    {
      label: getAnalyticsLabel("sigStrikesLandedPer5Mins"),
      value: formatAnalyticsValue(
        "sigStrikesLandedPer5Mins",
        analytics?.sigStrikesLandedPer5Mins ?? null,
      ),
      explanation: getAnalyticsExplanation("sigStrikesLandedPer5Mins"),
    },
    {
      label: getAnalyticsLabel("sigStrikesAbsorbedPer5Mins"),
      value: formatAnalyticsValue(
        "sigStrikesAbsorbedPer5Mins",
        analytics?.sigStrikesAbsorbedPer5Mins ?? null,
      ),
      explanation: getAnalyticsExplanation("sigStrikesAbsorbedPer5Mins"),
    },
    {
      label: "Differential",
      value: formatAnalyticsDifferential(
        "sigStrikesLandedPer5Mins",
        computeAnalyticsDifferential(
          analytics?.sigStrikesLandedPer5Mins ?? null,
          analytics?.sigStrikesAbsorbedPer5Mins ?? null,
        ),
      ),
      explanation: ANALYTICS_DIFFERENTIAL_EXPLANATIONS.sigStrikes,
    },
  ];

  const controlTime = [
    {
      label: getAnalyticsLabel("inControlPct"),
      value: formatAnalyticsValue("inControlPct", analytics?.inControlPct ?? null),
      explanation: getAnalyticsExplanation("inControlPct"),
    },
    {
      label: getAnalyticsLabel("underControlPct"),
      value: formatAnalyticsValue("underControlPct", analytics?.underControlPct ?? null),
      explanation: getAnalyticsExplanation("underControlPct"),
    },
    {
      label: "Differential",
      value: formatAnalyticsDifferential(
        "inControlPct",
        computeAnalyticsDifferential(
          analytics?.inControlPct ?? null,
          analytics?.underControlPct ?? null,
        ),
      ),
      explanation: ANALYTICS_DIFFERENTIAL_EXPLANATIONS.controlTime,
    },
  ];

  const takedowns = [
    {
      label: getAnalyticsLabel("takedownsAttemptedPer5Mins"),
      value: formatAnalyticsValue(
        "takedownsAttemptedPer5Mins",
        analytics?.takedownsAttemptedPer5Mins ?? null,
      ),
      explanation: getAnalyticsExplanation("takedownsAttemptedPer5Mins"),
    },
    {
      label: getAnalyticsLabel("takedownAccuracy"),
      value: formatAnalyticsValue("takedownAccuracy", analytics?.takedownAccuracy ?? null),
      explanation: getAnalyticsExplanation("takedownAccuracy"),
    },
    {
      label: getAnalyticsLabel("takedownDefence"),
      value: formatAnalyticsValue("takedownDefence", analytics?.takedownDefence ?? null),
      explanation: getAnalyticsExplanation("takedownDefence"),
    },
  ];

  return (
    <View style={styles.container}>
      {analytics?.computedAtFightCount != null && (
        <ThemedText style={[styles.fightCount, { color: theme.baseContentMuted }]}>
          Based on {analytics.computedAtFightCount} fight
          {analytics.computedAtFightCount !== 1 ? "s" : ""}
        </ThemedText>
      )}
      <StatSection title="Significant Strikes" stats={striking} />
      <View style={[styles.sectionDivider, { backgroundColor: theme.baseContentExtraMuted }]} />
      <StatSection title="Control Time" stats={controlTime} />
      <View style={[styles.sectionDivider, { backgroundColor: theme.baseContentExtraMuted }]} />
      <StatSection title="Takedowns" stats={takedowns} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  fightCount: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginTop: 12,
  },
  placeholder: {
    paddingVertical: 48,
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
