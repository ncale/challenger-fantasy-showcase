import { formatTime } from "@challenger-fantasy/core";
import type { SubmissionStatusOptions } from "@challenger-fantasy/types";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SectionHeader } from "~/components/base/SectionHeader";
import type { StatusType } from "~/components/StatusDot";
import ThemedHeader from "~/components/ThemedHeader";
import ThemedText from "~/components/ThemedText";
import ThemedView from "~/components/ThemedView";
import { EventSubmissionCard } from "~/components/track/EventSubmissionCard";
import type { DraftGroupSession } from "~/contexts/draft-registry-context";
import { useAppSettings } from "~/hooks/use-app-settings";
import { useDraftClock } from "~/hooks/use-draft-clock";
import { useDraftRegistry } from "~/hooks/use-draft-registry";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { getDraftStatusLabel } from "~/lib/draft-utils";
import { userSubmissionEventsQuery } from "~/lib/init-queries";
import { useAppTheme } from "~/providers/app-theme-provider";

function EmptyState() {
  const { theme } = useAppTheme();
  return (
    <View style={styles.emptyState}>
      <ThemedText style={styles.emptyTitle}>No games yet</ThemedText>
      <ThemedText style={styles.emptyBody} opacity={60}>
        Find a game in the Browse tab and join to track it here.
      </ThemedText>
      <TouchableOpacity
        style={[styles.emptyButton, { borderColor: theme.baseContentExtraMuted }]}
        onPress={() => router.push("/(protected)/(tabs)/browse")}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.emptyButtonText}>Go to Browse</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

function DraftSessionRow({ session }: { session: DraftGroupSession }) {
  const { theme } = useAppTheme();
  const { userId } = useSupabase();
  const { secondsRemaining, isCounting } = useDraftClock(session.draftState);
  const label = getDraftStatusLabel(session.draftState, userId);

  return (
    <>
      <ThemedText style={styles.draftRowLabel}>{label}</ThemedText>
      {isCounting && (
        <ThemedText style={[styles.draftRowTimer, { color: theme.baseContentMuted }]}>
          {formatTime(secondsRemaining)}
        </ThemedText>
      )}
    </>
  );
}

function DraftingSection() {
  const { theme } = useAppTheme();
  const { sessions, isDrafting, selectDraft } = useDraftRegistry();
  const sessionList = Object.values(sessions);

  if (!isDrafting) {
    return (
      <View style={styles.section}>
        <SectionHeader title="Active Drafts" count={0} />
        <View style={styles.draftBrowseRow}>
          <TouchableOpacity
            style={[styles.draftBrowseButton, { borderColor: theme.baseContentExtraMuted }]}
            onPress={() => router.navigate("/(protected)/(tabs)/browse?reset=true")}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.emptyButtonText}>Draft now</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <SectionHeader title="Active Drafts" count={sessionList.length} status="active-draft" />
      <View style={styles.previewList}>
        {sessionList.map((session) => (
          <Pressable
            key={session.draftGroupId}
            style={() => [styles.draftRow, { backgroundColor: theme.base200 }]}
            onPress={() => {
              selectDraft(session.draftGroupId);
              router.push("/(protected)/draft");
            }}
          >
            <DraftSessionRow session={session} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function EventSection({
  title,
  status,
  href,
  pageSize,
  userId,
  statusDot,
  showWhenEmpty,
}: {
  title: string;
  status: SubmissionStatusOptions["status"];
  href: string;
  pageSize: number;
  userId: string | undefined;
  statusDot?: StatusType;
  showWhenEmpty?: boolean;
}) {
  const { theme, opacity } = useThemeColors();

  const { data, isLoading } = useQuery(userSubmissionEventsQuery(userId, { status, pageSize }));

  const events = data?.submissionEvents ?? [];
  const total = data?.total ?? 0;
  const showMore = total > pageSize;
  const isEmpty = !isLoading && total === 0;

  if (isEmpty && !showWhenEmpty) return null;

  return (
    <View style={[styles.section, isEmpty && styles.sectionMuted]}>
      <SectionHeader
        title={title}
        href={isEmpty ? undefined : href}
        loading={isLoading}
        status={statusDot}
      />
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={theme.baseContentMuted}
          style={styles.previewLoading}
        />
      ) : isEmpty ? (
        <ThemedText style={[styles.emptyInline, { color: theme.baseContentMuted }]}>
          No {title.toLowerCase()} games.
        </ThemedText>
      ) : (
        <View style={styles.previewList}>
          {events.map((item) => (
            <EventSubmissionCard key={item.event.id} {...item} />
          ))}
          {showMore && (
            <Pressable style={() => [styles.seeAll]} onPress={() => router.push(href as never)}>
              <ThemedText style={[styles.seeAllText, { color: theme.baseContent + opacity[60] }]}>
                Show more →
              </ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export default function Track() {
  const { top, bottom } = useSafeAreaInsets();
  const { userId } = useSupabase();
  const { appConfig } = useAppSettings();

  const { data: liveData } = useQuery(
    userSubmissionEventsQuery(userId, {
      status: "live",
      pageSize: appConfig.trackPageLivePreviewCount,
    }),
  );
  const { data: upcomingData } = useQuery(
    userSubmissionEventsQuery(userId, {
      status: "upcoming",
      pageSize: appConfig.trackPageUpcomingPreviewCount,
    }),
  );
  const { data: completedData } = useQuery(
    userSubmissionEventsQuery(userId, {
      status: "completed",
      pageSize: appConfig.trackPageResultsPreviewCount,
    }),
  );
  const isEmpty =
    (liveData?.total ?? 0) === 0 &&
    (upcomingData?.total ?? 0) === 0 &&
    (completedData?.total ?? 0) === 0;

  return (
    <ThemedView style={[styles.screen, { paddingTop: top }]}>
      <ThemedHeader />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <DraftingSection />
        <EventSection
          title="Live"
          status="live"
          statusDot="live"
          href="/(protected)/(tabs)/(track)/live"
          pageSize={appConfig.trackPageLivePreviewCount}
          userId={userId}
        />
        <EventSection
          title="Upcoming"
          status="upcoming"
          href="/(protected)/(tabs)/(track)/upcoming"
          pageSize={appConfig.trackPageUpcomingPreviewCount}
          userId={userId}
          showWhenEmpty
        />
        <EventSection
          title="Results"
          status="completed"
          href="/(protected)/(tabs)/(track)/results"
          pageSize={appConfig.trackPageResultsPreviewCount}
          userId={userId}
        />
        {isEmpty && <EmptyState />}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    paddingTop: 8,
  },
  section: {
    marginHorizontal: 16,
  },
  sectionMuted: {
    opacity: 0.45,
  },
  emptyInline: {
    fontSize: 14,
    fontWeight: "500",
    paddingBottom: 12,
  },
  draftRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  draftRowLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  draftRowTimer: {
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  draftBrowseRow: {
    paddingBottom: 12,
  },
  draftBrowseButton: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    alignItems: "center",
  },
  previewList: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  previewLoading: {
    paddingVertical: 12,
  },
  seeAll: {
    paddingVertical: 10,
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    marginTop: 32,
    marginHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  emptyBody: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
