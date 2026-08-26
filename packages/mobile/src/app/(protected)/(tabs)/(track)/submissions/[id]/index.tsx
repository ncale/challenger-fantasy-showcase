import { formatOrdinal } from "@challenger-fantasy/core";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Pencil, ScrollText } from "lucide-react-native";
import { Suspense, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PageHeader } from "~/components/PageHeader";
import { SettingsSheet } from "~/components/SettingsSheet";
import { SubmissionLoadingSkeleton } from "~/components/SkeletonBox";
import { SubmissionGameRulesSheet } from "~/components/submission-route/SubmissionGameRulesSheet";
import { SubmissionRenameSheet } from "~/components/submission-route/SubmissionRenameSheet";
import { TeamsTab } from "~/components/submission-route/teams-tab";
import ThemedView from "~/components/ThemedView";
import { singleGameQuery, singleSubmissionQuery } from "~/lib/init-queries";
import { useAppTheme } from "~/providers/app-theme-provider";
import { FighterScoringModalProvider } from "~/providers/fighter-scoring-modal-provider";

const GameInfoScreen = () => {
  const { id: submissionId } = useLocalSearchParams<{ id?: string }>();
  const { theme } = useAppTheme();

  const { data: submission } = useSuspenseQuery(
    singleSubmissionQuery(submissionId, { bustCache: true }),
  );
  const { data: game } = useSuspenseQuery(singleGameQuery(submission.game.id));

  const settingsSheetRef = useRef<BottomSheetModal>(null);
  const rulesSheetRef = useRef<BottomSheetModal>(null);
  const renameSheetRef = useRef<BottomSheetModal>(null);

  const settingsSections = useMemo(
    () => [
      {
        title: "Submission",
        items: [
          {
            icon: ScrollText,
            label: "View game rules",
            onPress: () => {
              settingsSheetRef.current?.dismiss();
              rulesSheetRef.current?.present();
            },
          },
          {
            icon: Pencil,
            label: "Rename submission",
            onPress: () => {
              settingsSheetRef.current?.dismiss();
              renameSheetRef.current?.present();
            },
          },
        ],
      },
    ],
    [],
  );

  const score = submission.scoring.score;
  const position = submission.scoring.position;
  const eventName = submission.event?.name;
  const hasScore = score > 0;
  const hasPosition = position != null && position > 0;

  return (
    <FighterScoringModalProvider scoringProfile={game.config.scoringProfile}>
      <ThemedView style={{ flex: 1 }}>
        <PageHeader
          title="Entry summary"
          showSettings
          onSettingsPress={() => settingsSheetRef.current?.present()}
          backgroundColor={theme.base300}
        />
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme.base200, borderBottomColor: theme.base300 },
          ]}
        >
          <View style={styles.summaryLeft}>
            <Text style={[styles.summaryGame, { color: theme.baseContent }]} numberOfLines={1}>
              {submission.game?.name}
            </Text>
            {!!eventName && (
              <Text
                style={[styles.summaryEvent, { color: theme.baseContentMuted }]}
                numberOfLines={1}
              >
                {eventName}
              </Text>
            )}
          </View>
          {(hasScore || hasPosition) && (
            <View style={styles.summaryRight}>
              {hasScore && (
                <Text style={[styles.summaryScore, { color: theme.baseContent }]}>{score} pts</Text>
              )}
              {hasPosition && (
                <Text style={[styles.summaryPosition, { color: theme.baseContentMuted }]}>
                  {formatOrdinal(position)} place
                </Text>
              )}
            </View>
          )}
        </View>
        <Suspense fallback={<SubmissionLoadingSkeleton />}>
          <TeamsTab submissionId={submissionId} />
        </Suspense>
      </ThemedView>

      <SettingsSheet ref={settingsSheetRef} sections={settingsSections} />
      <SubmissionGameRulesSheet
        ref={rulesSheetRef}
        gameId={submission.game.id}
        gameName={submission.game?.name}
      />
      <SubmissionRenameSheet
        ref={renameSheetRef}
        submissionId={submissionId}
        currentName={submission.name}
      />
    </FighterScoringModalProvider>
  );
};

export default function SubmissionScreen() {
  return (
    <Suspense fallback={<SubmissionLoadingSkeleton />}>
      <GameInfoScreen />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryLeft: {
    flex: 1,
    gap: 3,
  },
  summaryGame: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  summaryEvent: {
    fontSize: 12,
    fontWeight: "500",
  },
  summaryRight: {
    alignItems: "flex-end",
    gap: 2,
    marginLeft: 16,
  },
  summaryScore: {
    fontSize: 15,
    fontWeight: "700",
  },
  summaryPosition: {
    fontSize: 12,
    fontWeight: "500",
  },
});
