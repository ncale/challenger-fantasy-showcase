import { getWeightClassLabelFromKey, SPECIAL_CHARS } from "@challenger-fantasy/shared";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import {
  type CarouselStat,
  FighterNameDetailed,
  StatCarousel,
  WinProbabilityDisplay,
} from "~/components/fighter";
import { useEventCard } from "~/hooks/use-event-card";
import { usePickRanking } from "~/hooks/use-pick-ranking";
import { fighterAnalyticsToCarouselStats } from "~/lib/analytics-stats";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../ThemedText";
import ThemedView from "../ThemedView";
import { ActiveSortPill } from "./ActiveSortPill";
import { StatsViewSelector } from "./StatsViewSelector";
import { useAnalyticSort } from "./use-analytic-sort";

type FighterItemProps = {
  fullName: string;
  opponent?: string;
  weightClass?: string;
  rank?: number;
  rightText?: string;
  fighterId?: string;
  backgroundColor?: string;
  winProbability?: number | null;
  onWinProbPress?: () => void;
  stats?: CarouselStat[];
  sortIndex?: number;
};

function FighterItem({
  fullName,
  opponent,
  weightClass,
  rank,
  rightText,
  fighterId,
  backgroundColor,
  winProbability,
  onWinProbPress,
  stats,
  sortIndex,
}: FighterItemProps) {
  const { theme } = useAppTheme();
  const itemBg = backgroundColor ?? theme.base300;

  return (
    <View style={[styles.container, { backgroundColor: itemBg }]}>
      <View style={styles.mainRow}>
        {sortIndex != null && (
          <View style={styles.indexCol}>
            <ThemedText style={[styles.indexText, { color: theme.baseContent }]}>
              {sortIndex}
            </ThemedText>
          </View>
        )}
        <View style={styles.nameCol}>
          <FighterNameDetailed
            fighterId={fighterId ?? ""}
            name={fullName}
            rank={rank}
            opponent={opponent}
            weightClass={weightClass}
          />
        </View>

        {rightText && (
          <View style={styles.rightTextCol}>
            <ThemedText style={styles.rightText}>{rightText}</ThemedText>
          </View>
        )}

        {winProbability !== undefined && (
          <WinProbabilityDisplay probability={winProbability ?? null} onPress={onWinProbPress} />
        )}
      </View>

      {stats && stats.length > 0 && <StatCarousel stats={stats} />}
    </View>
  );
}

export function FightersList({ eventId }: { eventId: string | undefined }) {
  const { theme } = useAppTheme();

  const { isReady, fighters, fights } = useEventCard(eventId);
  const { getRank } = usePickRanking(eventId);
  const { analyticSort, handleStatPress, clearSort, showFightCards } = useAnalyticSort();

  const onWinProbPress = useCallback(() => handleStatPress("winProbability"), [handleStatPress]);

  const sortedFighters = useMemo(() => {
    const sorted = [...fighters];
    if (analyticSort) {
      if (analyticSort.key === "winProbability") {
        sorted.sort((a, b) => {
          const va = a.winProbability ?? -Infinity;
          const vb = b.winProbability ?? -Infinity;
          return analyticSort.direction === "desc" ? vb - va : va - vb;
        });
      } else if (analyticSort.key !== "adp") {
        const key = analyticSort.key;
        sorted.sort((a, b) => {
          const va = a.analytics?.[key] ?? -Infinity;
          const vb = b.analytics?.[key] ?? -Infinity;
          return analyticSort.direction === "desc" ? vb - va : va - vb;
        });
      }
    }
    return sorted;
  }, [fighters, analyticSort]);

  return (
    <ThemedView style={{ flex: 1, backgroundColor: theme.base300 }}>
      <View style={[styles.topBar, { backgroundColor: theme.base300 }]}>
        <ThemedText style={[styles.barTitle, { color: theme.baseContentMuted }]}>
          Fighters
        </ThemedText>
        <View style={styles.topBarRight}>
          <ActiveSortPill sort={analyticSort} onClear={clearSort} />
          <StatsViewSelector />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={showFightCards ? styles.scrollFights : styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {isReady ? (
          showFightCards ? (
            fights.map((fight, i) => (
              <View key={fight.id} style={[styles.fightGroup, { marginTop: i === 0 ? 0 : 8 }]}>
                <View style={styles.fightLabel}>
                  <ThemedText style={[styles.fightMeta, { color: theme.baseContentMuted }]}>
                    Fight {fight.order ?? i + 1}
                  </ThemedText>
                  {(() => {
                    try {
                      const label = getWeightClassLabelFromKey(fight.weightClassKey);
                      return (
                        <ThemedText style={[styles.fightMeta, { color: theme.baseContentMuted }]}>
                          {SPECIAL_CHARS.INTERPUNCT} {label}
                        </ThemedText>
                      );
                    } catch {
                      return null;
                    }
                  })()}
                </View>
                <View style={styles.fightCard}>
                  <FighterItem
                    fullName={fight.fighter1.name}
                    fighterId={fight.fighter1.id}
                    rank={getRank(fight.fighter1.id)}
                    opponent={fight.fighter2.name}
                    weightClass={fight.weightClass}
                    winProbability={fight.fighter1.winProbability}
                    onWinProbPress={onWinProbPress}
                    stats={fighterAnalyticsToCarouselStats(
                      fight.fighter1.analytics,
                      handleStatPress,
                    )}
                  />
                  <FighterItem
                    fullName={fight.fighter2.name}
                    fighterId={fight.fighter2.id}
                    rank={getRank(fight.fighter2.id)}
                    opponent={fight.fighter1.name}
                    weightClass={fight.weightClass}
                    winProbability={fight.fighter2.winProbability}
                    onWinProbPress={onWinProbPress}
                    stats={fighterAnalyticsToCarouselStats(
                      fight.fighter2.analytics,
                      handleStatPress,
                    )}
                  />
                </View>
              </View>
            ))
          ) : (
            sortedFighters.map((fighter, i) => (
              <FighterItem
                key={fighter.id}
                fullName={fighter.name}
                fighterId={fighter.id}
                rank={getRank(fighter.id)}
                opponent={fighter.opponent.name}
                weightClass={fighter.weightClass}
                winProbability={fighter.winProbability}
                onWinProbPress={onWinProbPress}
                stats={fighterAnalyticsToCarouselStats(fighter.analytics, handleStatPress)}
                sortIndex={analyticSort ? i + 1 : undefined}
              />
            ))
          )
        ) : (
          <ThemedView>
            <ActivityIndicator size="large" color={theme.baseContent} />
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 56,
  },
  barTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scroll: {
    paddingVertical: 16,
    gap: 20,
  },
  scrollFights: {
    paddingVertical: 16,
    gap: 44,
  },
  fightGroup: {
    gap: 6,
  },
  fightLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-start",
    paddingHorizontal: 12,
  },
  fightMeta: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  fightCard: {
    overflow: "hidden",
  },
  container: {
    paddingTop: 12,
    minHeight: 52,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  indexCol: {
    width: 24,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  indexText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  nameCol: {
    flex: 1,
    justifyContent: "center",
    gap: 3,
  },
  rightTextCol: {
    justifyContent: "center",
    marginHorizontal: 12,
  },
  rightText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
