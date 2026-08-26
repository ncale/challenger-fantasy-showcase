import { formatDate } from "@challenger-fantasy/core";
import type { EventWithGamesDto } from "@challenger-fantasy/schemas";
import { StackActions } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SectionHeader } from "~/components/base/SectionHeader";
import ThemedHeader from "~/components/ThemedHeader";
import ThemedText from "~/components/ThemedText";
import { eventsQuery, useUpcomingEventsWithCacheSeed } from "~/lib/init-queries";
import { useAppTheme } from "~/providers/app-theme-provider";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function useEventStatusDot(event: EventWithGamesDto) {
  const { theme } = useAppTheme();

  return useMemo(() => {
    if (event.status === "live") {
      return { label: "LIVE", color: theme.success };
    }

    if (event.status !== "scheduled") return null;

    const startMs = event.startTimeUtc
      ? new Date(event.startTimeUtc).getTime()
      : new Date(event.eventDate).getTime();
    const diffMs = startMs - Date.now();

    if (diffMs <= 0 || diffMs >= TWENTY_FOUR_HOURS_MS) return null;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const label = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return { label, color: theme.warning };
  }, [event.status, event.startTimeUtc, event.eventDate, theme]);
}

const EventCard = ({ event }: { event: EventWithGamesDto }) => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const statusDot = useEventStatusDot(event);

  const dateLabel = event.startTimeUtc
    ? formatDate(event.startTimeUtc, "only-date")
    : new Date(event.eventDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });

  const gameCount = event.games.length;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.base200 }]}
      onPress={() => router.push(`/browse/events/${event.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardBody}>
        <View style={styles.cardNameRow}>
          <View style={{ flex: 1, gap: 3 }}>
            <ThemedText style={[styles.seriesName, { color: theme.baseContentMuted }]}>
              {event.seriesName}
            </ThemedText>
            <ThemedText style={styles.eventName} numberOfLines={2}>
              {event.headlineName}
            </ThemedText>
          </View>
          {statusDot && (
            <View style={[styles.statusBadge, { backgroundColor: statusDot.color + "22" }]}>
              <View style={[styles.statusDot, { backgroundColor: statusDot.color }]} />
              <ThemedText style={[styles.statusLabel, { color: statusDot.color }]}>
                {statusDot.label}
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.date, { color: theme.baseContentMuted }]}>
          {dateLabel}
        </ThemedText>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: theme.base300 }]}>
        <ThemedText style={[styles.gameCount, { color: theme.baseContentMuted }]}>
          {`${gameCount} ${gameCount === 1 ? "game" : "games"}`}
        </ThemedText>
        <ChevronRight size={14} color={theme.baseContentMuted} />
      </View>
    </TouchableOpacity>
  );
};

export default function Browse() {
  const { data: upcomingEvents } = useUpcomingEventsWithCacheSeed({
    page: 0,
    pageSize: 2,
    bustCache: true,
  });
  const { data: pastEvents } = useQuery(eventsQuery({ status: "past", page: 0, pageSize: 2 }));
  const { top } = useSafeAreaInsets();

  const { reset } = useLocalSearchParams();
  const navigation = useNavigation();
  useEffect(() => {
    if (reset && navigation.canGoBack()) {
      navigation.dispatch(StackActions.popToTop());
    }
  }, [reset]);

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <ThemedHeader />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 64 }]}
        showsVerticalScrollIndicator={true}
      >
        <SectionHeader title="Upcoming Events" />
        {upcomingEvents.events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        <SectionHeader title="Past Events" />
        {pastEvents?.events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    borderRadius: 14,
    overflow: "hidden",
  },
  cardBody: {
    padding: 12,
    gap: 4,
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  seriesName: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  eventName: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  gameCount: {
    fontSize: 13,
    fontWeight: "500",
  },
});
