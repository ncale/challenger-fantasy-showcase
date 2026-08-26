import type { DraftGroupTeamDto } from "@challenger-fantasy/schemas";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, Trophy } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, FlatList, Pressable, View, type ViewStyle } from "react-native";
import { Avatar, resolveAvatarUrl } from "~/components/Avatar";
import { SectionLabel } from "~/components/base/SectionLabel";
import { FighterNameSlim, StatBadge } from "~/components/fighter";
import ThemedText from "~/components/ThemedText";
import { useFighterScoringModal } from "~/hooks/use-fighter-scoring-modal";
import { useSupabase } from "~/hooks/use-supabase";
import { useUserModal } from "~/hooks/use-user-modal";
import { draftGroupQuery } from "~/lib/init-queries";
import { useAppTheme } from "~/providers/app-theme-provider";

const AVATAR_SIZE = 28;
const X_PADDING = 16;
const MAX_EXPAND_HEIGHT = 600;

type Team = DraftGroupTeamDto;
type Pick = DraftGroupTeamDto["picks"][number];

function FighterRow({ pick }: { pick: Pick }) {
  const { theme } = useAppTheme();
  const { openScoringBreakdown } = useFighterScoringModal();

  const canShowBreakdown = pick.score != null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 6,
        marginBottom: 4,
        borderRadius: 8,
        backgroundColor: `${theme.baseContent}06`,
      }}
    >
      <View style={{ flex: 1, paddingVertical: 10, paddingLeft: X_PADDING }}>
        <FighterNameSlim
          fighterId={pick.fighterId}
          name={pick.fighterName}
          opponent={pick.opponentName}
        />
      </View>

      <Pressable
        onPress={
          canShowBreakdown
            ? () => openScoringBreakdown(pick.fighterId, pick.fightId, pick.fighterName)
            : undefined
        }
        style={({ pressed }) => ({
          paddingRight: X_PADDING,
          opacity: pressed && canShowBreakdown ? 0.6 : 1,
        })}
      >
        <StatBadge
          label="pts"
          value={pick.score}
          displayValue={pick.score != null ? String(pick.score) : "—"}
        />
      </Pressable>
    </View>
  );
}

function TeamsLeaderboardRow({
  team,
  index,
  isExpanded,
  onToggle,
  isCurrentUser,
}: {
  team: Team;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isCurrentUser: boolean;
}) {
  const { theme } = useAppTheme();
  const { openUser } = useUserModal();

  const animation = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, MAX_EXPAND_HEIGHT],
  });
  const opacity = animation.interpolate({
    inputRange: [0, 0.35],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const position = team.position ?? index;

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: theme.baseContentExtraMuted }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: X_PADDING }}>
        <View style={{ width: 28, alignItems: "center" }}>
          {position === 1 ? (
            <Trophy
              size={22}
              color={isCurrentUser ? theme.trophyGold : theme.baseContentExtraMuted}
            />
          ) : (
            <ThemedText
              style={{
                textAlign: "center",
                fontSize: 16,
                color: isCurrentUser ? theme.primary : theme.baseContentMuted,
              }}
            >
              {position}
            </ThemedText>
          )}
        </View>

        <Pressable
          onPress={() => openUser(team.userId)}
          hitSlop={6}
          style={() => ({
            paddingHorizontal: 8,
            paddingVertical: 12,
          })}
        >
          <Avatar url={resolveAvatarUrl(team.avatarUrl ?? null)} size={AVATAR_SIZE} />
        </Pressable>

        <Pressable
          onPress={onToggle}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            paddingRight: X_PADDING,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ThemedText numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: "500" }}>
            {team.username}
          </ThemedText>
          <ThemedText
            style={{ fontSize: 16, fontWeight: "700", color: theme.baseContent, marginLeft: 8 }}
          >
            {team.score}
          </ThemedText>
          <Animated.View
            style={{
              marginLeft: 6,
              transform: [
                {
                  rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <ChevronDown size={16} color={theme.baseContentMuted} strokeWidth={2} />
          </Animated.View>
        </Pressable>
      </View>

      <Animated.View style={{ maxHeight, overflow: "hidden", opacity }}>
        <View style={{ paddingTop: 4, paddingBottom: 8 }}>
          {team.picks.length > 0 ? (
            team.picks.map((pick) => <FighterRow key={pick.fighterId} pick={pick} />)
          ) : (
            <View style={{ paddingHorizontal: X_PADDING + 12, paddingVertical: 10 }}>
              <ThemedText style={{ fontSize: 16, color: theme.baseContentMuted }}>
                Lineup not available
              </ThemedText>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

export function TeamsLeaderboard({
  style,
  submissionId,
}: {
  style: ViewStyle;
  submissionId: string;
}) {
  const { data } = useSuspenseQuery(draftGroupQuery(submissionId));
  const { userId } = useSupabase();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (userId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  return (
    <View style={[{ flex: 1 }, style]}>
      <FlatList
        data={data.teams}
        keyExtractor={(team) => team.userId}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<SectionLabel title="Leaderboard" />}
        renderItem={({ index, item: team }) => (
          <TeamsLeaderboardRow
            team={team}
            index={index + 1}
            isExpanded={expandedIds.has(team.userId)}
            onToggle={() => toggleExpand(team.userId)}
            isCurrentUser={team.userId === userId}
          />
        )}
      />
    </View>
  );
}
