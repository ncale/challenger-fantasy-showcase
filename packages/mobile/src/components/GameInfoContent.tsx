import { formatDate, SCORING_PROFILES, unCamelize } from "@challenger-fantasy/core";
import { isNullish } from "@challenger-fantasy/utils";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, View } from "react-native";
import ThemedText from "~/components/ThemedText";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { singleEventQuery, singleGameQuery } from "~/lib/init-queries";

const RuleRow = ({ label, value }: { label: string; value: string }) => {
  const { theme } = useThemeColors();
  return (
    <View style={[styles.ruleRow, { borderBottomColor: theme.baseContentExtraMuted }]}>
      <ThemedText style={[styles.ruleLabel, { color: theme.baseContentMuted }]}>{label}</ThemedText>
      <ThemedText style={styles.ruleValue}>{value}</ThemedText>
    </View>
  );
};

const SectionHeader = ({ label, marginTop }: { label: string; marginTop?: number }) => {
  const { theme } = useThemeColors();
  return (
    <ThemedText
      style={[styles.sectionLabel, { color: theme.baseContentMuted, marginTop: marginTop ?? 0 }]}
    >
      {label}
    </ThemedText>
  );
};

type Props = {
  gameId: string | undefined;
};

export const GameInfoContent = ({ gameId }: Props) => {
  // TODO: remove the single event query once event data is embedded into the game DTO
  const { data: game } = useQuery(singleGameQuery(gameId));
  const { data: event } = useQuery(singleEventQuery(game?.eventId));

  if (isNullish(game)) return null;

  const { config } = game;

  let submissionCutoff: string | null = null;
  if (config.submissionWindow?.closes_at) {
    submissionCutoff = formatDate(config.submissionWindow.closes_at, "game-time");
  } else if (event?.startTimeUtc) {
    submissionCutoff = formatDate(event.startTimeUtc, "game-time");
  } else if (event?.eventDate) {
    submissionCutoff = formatDate(event.eventDate, "game-time");
  }

  const scoringEntries = Object.entries(SCORING_PROFILES[config.scoringProfile]);

  return (
    <>
      <SectionHeader label="Game" />
      {config.mode.kind === "draft" && (
        <>
          <RuleRow label="Players" value={`${config.mode.numPeople}`} />
          <RuleRow label="Pick clock" value={`${config.mode.pickClockSeconds}s`} />
        </>
      )}
      <RuleRow label="Roster size" value={`${config.numPickSlots} fighters`} />
      {config.selectFrom.kind === "top_fights" && (
        <RuleRow label="Fight pool" value={`Top ${config.selectFrom.number} fights`} />
      )}
      {config.selectFrom.kind === "full_card" && <RuleRow label="Fight pool" value="Full card" />}
      {config.submissionWindow?.opens_at && (
        <RuleRow
          label="Submissions open"
          value={formatDate(config.submissionWindow.opens_at, "game-time")}
        />
      )}
      {submissionCutoff && <RuleRow label="Submissions close" value={submissionCutoff} />}

      {event?.startTimeUtc && (
        <>
          <SectionHeader label="Event" marginTop={28} />
          <RuleRow label="Date" value={formatDate(event.startTimeUtc, "only-date")} />
          <RuleRow label="Start" value={formatDate(event.startTimeUtc, "only-time")} />
          {event.prelimsStartTimeUtc && (
            <RuleRow label="Prelims" value={formatDate(event.prelimsStartTimeUtc, "only-time")} />
          )}
          {event.mainCardStartTimeUtc && (
            <RuleRow
              label="Main card"
              value={formatDate(event.mainCardStartTimeUtc, "only-time")}
            />
          )}
        </>
      )}

      <SectionHeader label="Scoring" marginTop={28} />
      {scoringEntries.map(([key, value]) => (
        <RuleRow key={key} label={unCamelize(key)} value={`+${value} pts`} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  ruleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ruleLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  ruleValue: {
    fontSize: 15,
    fontWeight: "600",
  },
});
