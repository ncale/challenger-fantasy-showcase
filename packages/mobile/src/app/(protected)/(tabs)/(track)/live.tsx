import { useInfiniteQuery } from "@tanstack/react-query";
import { FlatList, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TrackListSkeleton } from "~/components/SkeletonBox";
import ThemedText from "~/components/ThemedText";
import ThemedView from "~/components/ThemedView";
import { EventSubmissionCard } from "~/components/track/EventSubmissionCard";
import { useSupabase } from "~/hooks/use-supabase";
import { userSubmissionEventsInfiniteQuery } from "~/lib/init-queries";

export default function LiveSubmissions() {
  const { userId } = useSupabase();
  const { bottom } = useSafeAreaInsets();
  const { data, fetchNextPage, hasNextPage, isPending } = useInfiniteQuery(
    userSubmissionEventsInfiniteQuery(userId, { status: "live", pageSize: 20 }),
  );

  if (isPending) return <TrackListSkeleton />;

  const events = data?.pages.flatMap((p) => p.submissionEvents) ?? [];

  if (events.length === 0) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText opacity={60}>No live games.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.event.id}
        renderItem={({ item }) => <EventSubmissionCard {...item} />}
        contentContainerStyle={[styles.list, { paddingBottom: bottom + 16 }]}
        showsVerticalScrollIndicator={false}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
});
