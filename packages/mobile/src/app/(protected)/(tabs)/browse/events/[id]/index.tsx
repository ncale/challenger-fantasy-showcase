import type { GameDto } from "@challenger-fantasy/schemas";
import type BottomSheet from "@gorhom/bottom-sheet";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, ListOrdered } from "lucide-react-native";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { TabView } from "react-native-tab-view";
import { EventGameSheet } from "~/components/EventGameSheet";
import FightersTab from "~/components/GameCard/FightersTab";
import { GameIcon } from "~/components/GameIcon";
import { PageHeader } from "~/components/PageHeader";
import { type SettingsSection, SettingsSheet } from "~/components/SettingsSheet";
import { CustomTabBar } from "~/components/Tabs/CustomTabBar";
import { TabFallback } from "~/components/Tabs/TabFallback";
import ThemedText from "~/components/ThemedText";
import ThemedView from "~/components/ThemedView";
import { singleEventQuery } from "~/lib/init-queries";
import { useAppTheme } from "~/providers/app-theme-provider";

type GameRow = { id: string; name: string };

const EventGamesTab = ({
  games,
  onGamePress,
}: {
  games: GameDto[];
  onGamePress: (game: GameRow) => void;
}) => {
  const { theme } = useAppTheme();

  if (games.length === 0) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ThemedText style={{ color: theme.baseContentMuted, fontSize: 14 }}>
          No games available yet
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, backgroundColor: theme.base300 }}>
      <ScrollView contentContainerStyle={styles.gamesList}>
        <View style={[styles.gamesCard, { backgroundColor: theme.base200 }]}>
          {games.map((game, index) => (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.gameRow,
                {
                  borderTopColor: theme.base300,
                  borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                },
              ]}
              onPress={() => onGamePress(game)}
              activeOpacity={0.6}
            >
              <GameIcon game={game} />
              <ThemedText style={[styles.gameName, { color: theme.baseContent }]}>
                {game.name}
              </ThemedText>
              <ChevronRight size={16} color={theme.baseContentMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const EventScreen = ({ eventId }: { eventId: string }) => {
  const { data: event } = useSuspenseQuery(singleEventQuery(eventId));
  const layout = useWindowDimensions();
  const { theme } = useAppTheme();
  const router = useRouter();

  const sheetRef = useRef<BottomSheet>(null);
  const settingsSheetRef = useRef<BottomSheetModal>(null);
  const [selectedGame, setSelectedGame] = useState<GameRow | null>(null);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "games", title: "Games" },
    { key: "fighters", title: "Fighters" },
  ]);

  const handleGamePress = useCallback((game: GameRow) => {
    setSelectedGame(game);
    sheetRef.current?.snapToIndex(0);
  }, []);

  const settingsSections = useMemo<SettingsSection[]>(
    () => [
      {
        items: [
          {
            icon: ListOrdered,
            label: "Set pick rankings",
            onPress: () => {
              settingsSheetRef.current?.dismiss();
              router.push(`/(protected)/(tabs)/browse/events/${eventId}/pick-ranking`);
            },
          },
        ],
      },
    ],
    [eventId, router],
  );

  const renderScene = useCallback(
    ({ route }: { route: { key: string } }) => {
      switch (route.key) {
        case "games":
          return <EventGamesTab games={event.games} onGamePress={handleGamePress} />;
        case "fighters":
          return (
            <Suspense fallback={<TabFallback />}>
              <FightersTab eventId={eventId} />
            </Suspense>
          );
        default:
          return null;
      }
    },
    [eventId, event.games, handleGamePress],
  );

  return (
    <>
      <PageHeader
        title={event.headlineName}
        showSettings
        onSettingsPress={() => settingsSheetRef.current?.present()}
        backgroundColor={theme.base300}
      />
      <CustomTabBar navigationState={{ index, routes }} onIndexChange={setIndex} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={styles.tabView}
        renderTabBar={() => null}
      />
      <EventGameSheet
        ref={sheetRef}
        gameId={selectedGame?.id ?? null}
        gameName={selectedGame?.name}
      />
      <SettingsSheet ref={settingsSheetRef} sections={settingsSections} />
    </>
  );
};

export default function EventIndex() {
  const { id: eventId } = useLocalSearchParams<{ id?: string }>();

  return (
    <Suspense
      fallback={
        <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      }
    >
      {eventId ? <EventScreen eventId={eventId} /> : null}
    </Suspense>
  );
}

const styles = StyleSheet.create({
  tabView: {
    flex: 1,
  },
  gamesList: {
    padding: 16,
  },
  gamesCard: {
    borderRadius: 14,
    overflow: "hidden",
  },
  gameRow: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  gameName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
});
