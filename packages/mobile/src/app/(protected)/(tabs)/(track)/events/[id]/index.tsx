import type { SubmissionStatusOptions } from "@challenger-fantasy/types";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Suspense, useCallback, useState } from "react";
import { FlatList, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabView } from "react-native-tab-view";
import FightersTab from "~/components/GameCard/FightersTab";
import { PageHeader } from "~/components/PageHeader";
import { TrackListSkeleton } from "~/components/SkeletonBox";
import { CustomTabBar } from "~/components/Tabs/CustomTabBar";
import { TabFallback } from "~/components/Tabs/TabFallback";
import ThemedText from "~/components/ThemedText";
import ThemedView from "~/components/ThemedView";
import { SubmissionCard } from "~/components/track/SubmissionCard";
import { useSupabase } from "~/hooks/use-supabase";
import { singleEventQuery, userSubmissionsQuery } from "~/lib/init-queries";
import { useAppTheme } from "~/providers/app-theme-provider";

const EVENT_TO_SUBMISSION_STATUS: Record<string, SubmissionStatusOptions["status"]> = {
  live: "live",
  scheduled: "upcoming",
  final: "completed",
  cancelled: "completed",
};

function EntriesTab({ eventId, eventStatus }: { eventId: string; eventStatus: string }) {
  const { userId } = useSupabase();
  const { bottom } = useSafeAreaInsets();
  const submissionStatus = EVENT_TO_SUBMISSION_STATUS[eventStatus] ?? "completed";

  const { data, isPending } = useQuery(
    userSubmissionsQuery(userId, { status: submissionStatus, pageSize: 50 }),
  );

  const entries = (data?.submissions ?? []).filter((s) => s.event?.id === eventId);

  if (isPending) {
    return <TrackListSkeleton />;
  }

  if (entries.length === 0) {
    return (
      <ThemedView style={styles.emptyTab}>
        <ThemedText opacity={60}>No entries for this event.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.tab}>
      <FlatList
        data={entries}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => <SubmissionCard submission={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

function TrackEventScreen({ eventId }: { eventId: string }) {
  const { data: event } = useSuspenseQuery(singleEventQuery(eventId));
  const layout = useWindowDimensions();
  const { theme } = useAppTheme();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "entries", title: "Entries" },
    { key: "fighters", title: "Fighters" },
  ]);

  const renderScene = useCallback(
    ({ route }: { route: { key: string } }) => {
      switch (route.key) {
        case "entries":
          return <EntriesTab eventId={eventId} eventStatus={event.status} />;
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
    [eventId, event.status],
  );

  return (
    <ThemedView style={styles.screen}>
      <PageHeader title={event.headlineName} backgroundColor={theme.base300} />
      <CustomTabBar navigationState={{ index, routes }} onIndexChange={setIndex} />
      <TabView
        lazy
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={styles.tabView}
        renderTabBar={() => null}
      />
    </ThemedView>
  );
}

export default function TrackEventIndex() {
  const { id: eventId } = useLocalSearchParams<{ id?: string }>();

  if (!eventId) return null;

  return (
    <Suspense fallback={<TrackListSkeleton />}>
      <TrackEventScreen eventId={eventId} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  tabView: {
    flex: 1,
  },
  tab: {
    flex: 1,
  },
  emptyTab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
