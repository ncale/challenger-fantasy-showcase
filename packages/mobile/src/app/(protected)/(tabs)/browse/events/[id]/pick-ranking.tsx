import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Minus, Plus, RotateCcw, Save } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  type RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBar, TabView } from "react-native-tab-view";
import { FighterNameSlim } from "~/components/fighter";
import { CircleButton } from "~/components/fighter/CircleButton";
import { StatBadge } from "~/components/fighter/StatBadge";
import { SortPills, useSortPills } from "~/components/SortPills";
import ThemedText from "~/components/ThemedText";
import ThemedView from "~/components/ThemedView";
import { useEventCard } from "~/hooks/use-event-card";
import { useAppTheme } from "~/providers/app-theme-provider";
import { PickRankingProvider, usePickRankingContext } from "./pick-ranking-provider";

type FighterRow = {
  id: string;
  name: string;
  opponent: string;
  weightClass: string;
  winProbability: number | null | undefined;
};

export default function PickRankingPage() {
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const { fighters } = useEventCard(eventId);

  const allFighters = useMemo<FighterRow[]>(
    () =>
      fighters.map((f) => ({
        id: f.id,
        name: f.name,
        opponent: f.opponent.name,
        weightClass: f.weightClass ?? "",
        winProbability: f.winProbability,
      })),
    [fighters],
  );

  const allFighterIds = useMemo(() => allFighters.map((f) => f.id), [allFighters]);
  const fighterById = useMemo(() => new Map(allFighters.map((f) => [f.id, f])), [allFighters]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PickRankingProvider eventId={eventId} allFighterIds={allFighterIds}>
        <PickRankingContent allFighters={allFighters} fighterById={fighterById} />
      </PickRankingProvider>
    </GestureHandlerRootView>
  );
}

type ContentProps = {
  allFighters: FighterRow[];
  fighterById: Map<string, FighterRow>;
};

function PickRankingContent({ allFighters, fighterById }: ContentProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const layout = useWindowDimensions();

  const [tabIndex, setTabIndex] = useState(0);
  const fighterSortPills = useSortPills(["fights", "prob_desc"]);

  const sortedFighters = useMemo(() => {
    if (fighterSortPills.value === "prob_desc") {
      return [...allFighters].sort((a, b) => {
        if (a.winProbability == null && b.winProbability == null) return 0;
        if (a.winProbability == null) return 1;
        if (b.winProbability == null) return -1;
        return b.winProbability - a.winProbability;
      });
    }
    return allFighters;
  }, [allFighters, fighterSortPills.value]);

  const { rankedIds, isDirty, isSaving, isAdded, add, remove, reorder, save, reset } =
    usePickRankingContext();

  const routes = useMemo(
    () => [
      { key: "fighters", title: "Fighters" },
      { key: "rankings", title: rankedIds.length > 0 ? `Rank (${rankedIds.length})` : "Rank" },
    ],
    [rankedIds.length],
  );

  const rankedFighters = useMemo(
    () => rankedIds.map((id) => fighterById.get(id)).filter(Boolean) as FighterRow[],
    [rankedIds, fighterById],
  );

  const renderRankedItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<FighterRow>) => (
      <ScaleDecorator activeScale={1.03}>
        <TouchableOpacity
          onLongPress={drag}
          delayLongPress={200}
          activeOpacity={1}
          disabled={isActive}
          style={[
            styles.rankedRow,
            { backgroundColor: theme.base300, borderBottomColor: theme.base200 },
          ]}
        >
          <CircleButton
            onPress={() => remove(item.id)}
            icon={<Minus size={16} color={theme.white} />}
          />
          <View style={styles.nameCol}>
            <FighterNameSlim
              fighterId={item.id}
              name={item.name}
              opponent={item.opponent}
              weightClass={item.weightClass}
            />
          </View>
          <StatBadge label="Win prob" value={item.winProbability} />
        </TouchableOpacity>
      </ScaleDecorator>
    ),
    [theme, remove],
  );

  const renderFighterItem = useCallback(
    ({ item }: { item: FighterRow }) => {
      const added = isAdded(item.id);
      const atCap = rankedIds.length >= 12;
      const rank = added ? rankedIds.indexOf(item.id) + 1 : null;
      return (
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.fighterRow,
            { backgroundColor: theme.base300, borderBottomColor: theme.base200 },
          ]}
        >
          <CircleButton
            onPress={() => (added ? remove(item.id) : add(item.id))}
            active={added}
            disabled={!added && atCap}
            icon={
              added ? (
                <ThemedText style={[styles.rankBadge, { color: theme.white }]}>{rank}</ThemedText>
              ) : (
                <Plus size={18} color={theme.white} />
              )
            }
          />
          <View style={styles.nameCol}>
            <FighterNameSlim
              fighterId={item.id}
              name={item.name}
              opponent={item.opponent}
              weightClass={item.weightClass}
            />
          </View>
          <StatBadge label="Win prob" value={item.winProbability} />
        </TouchableOpacity>
      );
    },
    [theme, isAdded, add, remove, rankedIds],
  );

  const rankingsScene = useMemo(
    () => (
      <ThemedView style={[styles.tabContent, { backgroundColor: theme.base300 }]}>
        {rankedFighters.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={[styles.emptyText, { color: theme.baseContentMuted }]}>
              Go to All Fighters to add rankings
            </ThemedText>
          </View>
        ) : (
          <NestableScrollContainer
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.rankedListRow}>
              <View style={styles.rankNumberCol}>
                {rankedFighters.map((fighter, i) => (
                  <View
                    key={fighter.id}
                    style={[styles.rankNumberCell, { borderBottomColor: theme.base200 }]}
                  >
                    <ThemedText style={[styles.rankNumber, { color: theme.baseContent }]}>
                      {i + 1}
                    </ThemedText>
                  </View>
                ))}
              </View>
              <NestableDraggableFlatList
                data={rankedFighters}
                keyExtractor={(f) => f.id}
                renderItem={renderRankedItem}
                onDragEnd={({ data }) => reorder(data.map((f) => f.id))}
                style={{ width: layout.width - 36 }}
              />
            </View>
          </NestableScrollContainer>
        )}
      </ThemedView>
    ),
    [theme, insets.bottom, rankedFighters, renderRankedItem, reorder, layout.width],
  );

  const fightersScene = useMemo(
    () => (
      <ThemedView style={[styles.tabContent, { backgroundColor: theme.base300 }]}>
        <SortPills {...fighterSortPills} />
        <FlatList
          data={sortedFighters}
          keyExtractor={(f) => f.id}
          renderItem={renderFighterItem}
          contentContainerStyle={[
            styles.flatListCard,
            { backgroundColor: theme.base300, paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    ),
    [theme, insets.bottom, sortedFighters, renderFighterItem, fighterSortPills],
  );

  const renderScene = useCallback(
    ({ route }: { route: { key: string } }) => {
      switch (route.key) {
        case "rankings":
          return rankingsScene;
        case "fighters":
          return fightersScene;
        default:
          return null;
      }
    },
    [rankingsScene, fightersScene],
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.base300 }]}>
        <TouchableOpacity
          onPress={() => {
            if (isDirty) {
              Alert.alert("Unsaved Changes", "Save your rankings before leaving?", [
                { text: "Cancel", style: "cancel" },
                { text: "Don't Save", style: "destructive", onPress: () => router.back() },
                {
                  text: "Save",
                  onPress: () => {
                    save();
                    router.back();
                  },
                },
              ]);
            } else {
              router.back();
            }
          }}
          hitSlop={8}
        >
          <ChevronLeft size={24} color={theme.baseContent} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer} pointerEvents="none">
          <ThemedText style={[styles.headerTitle, { color: theme.baseContent }]}>
            Pick Rankings
          </ThemedText>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Clear Rankings", "Remove all fighters from your rankings?", [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", style: "destructive", onPress: reset },
              ]);
            }}
            disabled={rankedIds.length === 0}
            hitSlop={8}
            style={{ opacity: rankedIds.length > 0 ? 1 : 0.3 }}
          >
            <RotateCcw size={20} color={theme.baseContent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={save}
            disabled={!isDirty || isSaving}
            hitSlop={8}
            style={{ opacity: isDirty && !isSaving ? 1 : 0.3 }}
          >
            <Save size={20} color={theme.baseContent} />
          </TouchableOpacity>
        </View>
      </View>

      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: theme.baseContent }}
            style={{ backgroundColor: theme.base300 }}
          />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tabContent: {
    flex: 1,
  },
  flatListCard: {
    overflow: "hidden",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  rankedListRow: {
    flexDirection: "row",
  },
  rankNumberCol: {
    width: 36,
  },
  rankNumberCell: {
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rankedRow: {
    flex: 1,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
    paddingRight: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  nameCol: {
    flex: 1,
    gap: 2,
  },
  fighterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  rankBadge: {
    fontSize: 13,
    fontWeight: "700",
  },
});
