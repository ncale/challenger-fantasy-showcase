import { formatDate } from "@challenger-fantasy/core";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, resolveAvatarUrl } from "~/components/Avatar";
import { SkeletonBox } from "~/components/SkeletonBox";
import ThemedText from "~/components/ThemedText";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { userProfileQuery, userStatsQuery } from "~/lib/init-queries";

export function UserSheetContent({ userId }: { userId: string }) {
  const { theme } = useThemeColors();
  const { bottom } = useSafeAreaInsets();
  const { data: profile, isLoading: isProfileLoading } = useQuery(userProfileQuery(userId));
  const { data: stats, isLoading: isStatsLoading } = useQuery(userStatsQuery(userId));

  const isLoading = isProfileLoading || isStatsLoading;

  return (
    <BottomSheetView style={[styles.container, { paddingBottom: bottom + 24 }]}>
      <View style={[styles.indicator, { backgroundColor: theme.baseContentExtraMuted }]} />

      {isLoading ? (
        <View style={styles.skeleton}>
          <SkeletonBox width={72} height={72} borderRadius={36} />
          <SkeletonBox width="50%" height={22} borderRadius={6} style={{ marginTop: 14 }} />
          <SkeletonBox width="40%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
          <View style={[styles.statsRow, styles.skeletonStatsRow]}>
            <SkeletonBox height={44} style={{ flex: 1 }} />
            <SkeletonBox height={44} style={{ flex: 1 }} />
            <SkeletonBox height={44} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <>
          <Avatar url={resolveAvatarUrl(profile?.avatarUrl ?? null)} size={72} />
          <ThemedText style={styles.username}>{profile?.username ?? "—"}</ThemedText>
          {profile?.since && (
            <ThemedText style={styles.since} opacity={60}>
              Member since {formatDate(profile.since, "only-date")}
            </ThemedText>
          )}

          <View style={[styles.statsRow, { borderColor: theme.baseContentExtraMuted }]}>
            <View style={styles.stat}>
              <ThemedText style={styles.statValue}>{stats?.gamesPlayed ?? 0}</ThemedText>
              <ThemedText style={styles.statLabel} opacity={60}>
                Played
              </ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.baseContentExtraMuted }]} />
            <View style={styles.stat}>
              <ThemedText style={styles.statValue}>{stats?.gamesWon ?? 0}</ThemedText>
              <ThemedText style={styles.statLabel} opacity={60}>
                Won
              </ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.baseContentExtraMuted }]} />
            <View style={styles.stat}>
              <ThemedText style={styles.statValue}>{stats?.winPercentage ?? 0}%</ThemedText>
              <ThemedText style={styles.statLabel} opacity={60}>
                Win Rate
              </ThemedText>
            </View>
          </View>
        </>
      )}
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  indicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 24,
  },
  skeleton: {
    alignItems: "center",
    width: "100%",
  },
  username: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 14,
    letterSpacing: -0.3,
  },
  since: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingVertical: 16,
  },
  skeletonStatsRow: {
    gap: 8,
    paddingHorizontal: 8,
    borderWidth: 0,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
  },
});
