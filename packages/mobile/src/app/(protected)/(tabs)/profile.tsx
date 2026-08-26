import { isNullish } from "@challenger-fantasy/core";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ChevronRightIcon, SettingsIcon } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, resolveAvatarUrl } from "~/components/Avatar";
import { SkeletonBox } from "~/components/SkeletonBox";
import ThemedText from "~/components/ThemedText";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { userStatsQuery } from "~/lib/init-queries";

export default function Profile() {
  const { theme } = useThemeColors();
  const { profile, userId } = useSupabase();
  const insets = useSafeAreaInsets();
  const { data: stats, isLoading: isStatsLoading } = useQuery(userStatsQuery(userId));

  if (isNullish(profile) || isNullish(profile.since)) return null;

  const currentAvatar = resolveAvatarUrl(profile.avatarUrl);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.base300 }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Settings gear — top right */}
      <Pressable
        style={[styles.settingsButton, { top: insets.top + 16 }]}
        onPress={() => router.push("/(protected)/settings")}
        hitSlop={12}
      >
        <SettingsIcon size={22} color={theme.baseContentMuted} />
      </Pressable>

      {/* Header */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarRing, { borderColor: theme.baseContentExtraMuted }]}>
          <Avatar url={currentAvatar} size={96} />
        </View>
        <ThemedText style={styles.username}>{profile.username}</ThemedText>
        <ThemedText style={styles.memberSince} opacity={60}>
          Member since{" "}
          {new Date(profile.since).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
          })}
        </ThemedText>
      </View>

      {/* Stats */}
      <View style={[styles.card, styles.statsCard, { backgroundColor: theme.base200 }]}>
        {isStatsLoading ? (
          <SkeletonBox height={44} style={styles.statSkeleton} />
        ) : (
          <>
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
          </>
        )}
      </View>

      {/* Settings */}
      <View style={[styles.card, { backgroundColor: theme.base200 }]}>
        <Pressable
          style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.push("/(protected)/profile/edit-avatar")}
        >
          <ThemedText style={styles.rowLabel}>Profile Picture</ThemedText>
          <View style={styles.rowRight}>
            <Avatar url={currentAvatar} size={28} />
            <ChevronRightIcon size={16} color={theme.baseContentMuted} />
          </View>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: theme.baseContentExtraMuted }]} />

        <Pressable
          style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.push("/(protected)/profile/edit-username")}
        >
          <ThemedText style={styles.rowLabel}>Username</ThemedText>
          <View style={styles.rowRight}>
            <ThemedText style={styles.rowValue} opacity={60}>
              {profile.username}
            </ThemedText>
            <ChevronRightIcon size={16} color={theme.baseContentMuted} />
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 20,
    alignItems: "stretch",
  },
  avatarSection: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 56,
    borderWidth: 2,
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
  },
  memberSince: {
    fontSize: 14,
  },
  card: {
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowValue: {
    fontSize: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  settingsButton: {
    position: "absolute",
    right: 20,
    zIndex: 10,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
  },
  statSkeleton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
