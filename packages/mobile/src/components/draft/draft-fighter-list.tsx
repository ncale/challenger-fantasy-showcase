import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SortPills, useSortPills } from "~/components/SortPills";
import ThemedView from "~/components/ThemedView";
import { useDraftSession } from "~/hooks/use-draft-session";
import type { EventCardFighter } from "~/hooks/use-event-card";
import { usePickRanking } from "~/hooks/use-pick-ranking";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { useDraftTab } from "./draft-context";
import { DraftFighterItem } from "./draft-fighter-item";

export function DraftFighterList({
  style,
  extraBottomPadding = 0,
}: {
  style?: StyleProp<ViewStyle>;
  extraBottomPadding?: number;
}) {
  const { theme } = useThemeColors();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const { game, availableFighters, pickFighter, currentPicker } = useDraftSession();
  const { queue, addToQueue, removeFromQueue } = useDraftTab();

  const { userId } = useSupabase();
  const isCurrentPicker = userId === currentPicker?.userId;

  const { getRank, hasRankings } = usePickRanking(game?.eventId);

  const sortPills = useSortPills(
    hasRankings ? ["fights", "prob_desc", "ranking"] : ["fights", "prob_desc"],
    "fights",
  );

  const displayedFighters = useMemo(() => {
    if (!game) return [];
    // TODO: this logic should be moved to the backend or derived in a hook
    if (game.config.selectFrom.kind === "top_fights") {
      const limit = game.config.selectFrom.number;
      return availableFighters.filter((f) => f.fightOrder <= limit);
    }
    if (game.config.selectFrom.kind === "full_card") {
      return availableFighters;
    }
    return availableFighters;
  }, [availableFighters, game]);

  const sortedFighters = useMemo(() => {
    const fighters = [...displayedFighters];
    if (sortPills.value === "ranking") {
      return fighters.sort((a, b) => {
        const ra = getRank(a.id) ?? Number.MAX_SAFE_INTEGER;
        const rb = getRank(b.id) ?? Number.MAX_SAFE_INTEGER;
        return ra - rb;
      });
    }
    if (sortPills.value === "prob_desc") {
      return fighters.sort((a, b) => (b.winProbability ?? 0) - (a.winProbability ?? 0));
    }
    return fighters.sort((a, b) => a.fightOrder - b.fightOrder);
  }, [displayedFighters, sortPills.value, getRank]);

  if (!game || availableFighters.length === 0) {
    return (
      <ThemedView>
        <ActivityIndicator size="large" color={theme.baseContent} />
      </ThemedView>
    );
  }

  return (
    <View style={[style, { flex: 1 }]}>
      <SortPills {...sortPills} backgroundColor={theme.base200} />
      <BottomSheetFlatList
        data={sortedFighters}
        keyExtractor={(fighter: EventCardFighter) => `selector-table-item-${fighter.id}`}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={{ paddingBottom: bottomInset + extraBottomPadding }}
        renderItem={({ item: fighter }: { item: EventCardFighter }) => {
          const queueIdx = queue.findIndex((q) => q.id === fighter.id);
          const queuePosition = queueIdx === -1 ? null : queueIdx + 1;

          return (
            <DraftFighterItem
              variant="selector"
              fighterId={fighter.id}
              fullName={fighter.name}
              opponent={fighter.opponent.name}
              weightClass={fighter.weightClass ?? undefined}
              onDraft={() => pickFighter(fighter.id)}
              draftDisabled={!isCurrentPicker}
              rankPosition={getRank(fighter.id)}
              queuePosition={queuePosition}
              onToggleQueue={() => {
                if (queuePosition != null) {
                  removeFromQueue(fighter.id);
                } else {
                  addToQueue({
                    id: fighter.id,
                    name: fighter.name,
                    opponent: fighter.opponent.name,
                    weightClass: fighter.weightClass ?? undefined,
                  });
                }
              }}
            />
          );
        }}
      />
    </View>
  );
}
