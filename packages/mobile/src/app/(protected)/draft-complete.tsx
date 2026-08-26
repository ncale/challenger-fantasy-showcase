import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedText from "~/components/ThemedText";
import { useDraftRegistry } from "~/hooks/use-draft-registry";
import { useDraftSession } from "~/hooks/use-draft-session";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { singleFighterQuery } from "~/lib/init-queries";

function PickRow({ fighterId, round }: { fighterId: string; round: number }) {
  const { theme } = useThemeColors();
  const { data: fighter } = useQuery(singleFighterQuery(fighterId));

  return (
    <View style={[styles.pickRow, { borderBottomColor: theme.baseContentExtraMuted }]}>
      <ThemedText style={[styles.pickRound, { color: theme.baseContentMuted }]}>
        Round {round}
      </ThemedText>
      <ThemedText style={styles.pickName}>{fighter?.name ?? "…"}</ThemedText>
    </View>
  );
}

export default function DraftComplete() {
  const { theme } = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const { selectedDraftGroupId, leaveDraft } = useDraftRegistry();
  const { draftState, game } = useDraftSession();
  const { userId } = useSupabase();
  const queryClient = useQueryClient();

  const groupIdRef = useRef(selectedDraftGroupId);
  useEffect(() => {
    groupIdRef.current = selectedDraftGroupId;
  }, [selectedDraftGroupId]);
  useEffect(
    () => () => {
      if (groupIdRef.current) leaveDraft(groupIdRef.current);
    },
    [],
  );

  const myDrafter = Array.from(draftState?.users.values() ?? []).find((d) => d.userId === userId);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.base300,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <ConfettiCannon
          count={80}
          origin={{ x: -30, y: screenHeight * 0.6 }}
          autoStart
          fadeOut
          explosionSpeed={500}
          fallSpeed={3200}
          colors={["#FFD700", "#FF4C4C", "#4DA6FF", "#44D98E", "#C44DFF", "#FF9944"]}
        />
        <ConfettiCannon
          count={160}
          origin={{ x: screenWidth + 30, y: screenHeight * 0.6 }}
          autoStart
          fadeOut
          explosionSpeed={500}
          fallSpeed={3200}
          colors={["#FFD700", "#FF4C4C", "#4DA6FF", "#44D98E", "#C44DFF", "#FF9944"]}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Your lineup is locked in</ThemedText>
          {game && (
            <ThemedText style={styles.subtitle} opacity={60}>
              {game.name}
            </ThemedText>
          )}
        </View>

        {myDrafter && myDrafter.picks.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.base200 }]}>
            <ThemedText style={styles.cardLabel} opacity={60}>
              Your picks
            </ThemedText>
            {myDrafter.picks.map((pick, i) => (
              <PickRow key={pick.fighterId} fighterId={pick.fighterId} round={i + 1} />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.actions, { paddingHorizontal: 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.secondaryButton,
            {
              backgroundColor: theme.base200,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={() => {
            queryClient.invalidateQueries({ queryKey: ["users", userId, "submissions"] });
            router.replace("/(protected)/(tabs)/browse");
          }}
        >
          <ThemedText style={styles.buttonText}>Go home</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 20,
  },
  header: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  card: {
    borderRadius: 14,
    padding: 16,
    gap: 0,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pickRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickRound: {
    fontSize: 13,
    fontWeight: "500",
  },
  pickName: {
    fontSize: 15,
    fontWeight: "600",
  },
  actions: {
    gap: 10,
    paddingTop: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
