import { SCORING_PROFILES, unCamelize } from "@challenger-fantasy/core";
import { isNullish } from "@challenger-fantasy/utils";
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react-native";
import { forwardRef, type RefObject, useCallback, useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedText from "~/components/ThemedText";
import { useDraftRegistry } from "~/hooks/use-draft-registry";
import { singleEventQuery, singleGameQuery } from "~/lib/init-queries";
import { useAppTheme } from "~/providers/app-theme-provider";

const SNAP_POINTS = ["100%"];

type Props = {
  gameId: string | null;
  gameName?: string;
};

function RuleRow({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.ruleRow, { borderBottomColor: theme.baseContentExtraMuted }]}>
      <ThemedText style={[styles.ruleLabel, { color: theme.baseContentMuted }]}>{label}</ThemedText>
      <ThemedText style={styles.ruleValue}>{value}</ThemedText>
    </View>
  );
}

function ScoringSection({ profile }: { profile: string }) {
  const { theme } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(SCORING_PROFILES[profile as keyof typeof SCORING_PROFILES] ?? {});
  const profileLabel = profile.charAt(0).toUpperCase() + profile.slice(1);

  return (
    <View>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={[
          styles.scoringHeader,
          { borderBottomColor: expanded ? "transparent" : theme.baseContentExtraMuted },
        ]}
      >
        <ThemedText style={styles.ruleLabel}>
          <ThemedText style={{ color: theme.baseContentMuted }}>Scoring </ThemedText>
          {profileLabel}
        </ThemedText>
        {expanded ? (
          <ChevronUpIcon size={14} color={theme.baseContentMuted} />
        ) : (
          <ChevronDownIcon size={14} color={theme.baseContentMuted} />
        )}
      </Pressable>
      {expanded &&
        entries.map(([key, value]) => (
          <RuleRow key={key} label={unCamelize(key)} value={`+${value} pts`} />
        ))}
    </View>
  );
}

function GameSheetContent({ gameId, onClose }: { gameId: string; onClose: () => void }) {
  const { theme } = useAppTheme();
  const { top } = useSafeAreaInsets();
  const { data: game } = useQuery(singleGameQuery(gameId));
  const { data: event } = useQuery(singleEventQuery(game?.eventId));
  const { sessions, joinDraft } = useDraftRegistry();
  const router = useRouter();

  const isDraftActive = Object.values(sessions).some(
    (s) => s.gameId === gameId && s.draftState?.status !== "completed",
  );

  if (isNullish(game)) return null;

  const { config } = game;
  const opensAt = config.submissionWindow?.opens_at;
  const closesAt =
    config.submissionWindow?.closes_at ?? event?.startTimeUtc ?? event?.eventDate ?? null;

  return (
    <>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.base200,
            borderBottomColor: theme.baseContentExtraMuted,
            paddingTop: top + 14,
          },
        ]}
      >
        <View style={styles.headerText}>
          <ThemedText style={[styles.seriesName, { color: theme.baseContentMuted }]}>
            {event?.seriesName}
          </ThemedText>
          <ThemedText style={styles.gameName} numberOfLines={2}>
            {game.name}
          </ThemedText>
        </View>
        <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
          <XIcon size={24} color={theme.baseContentMuted} strokeWidth={2} />
        </Pressable>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={[styles.content, { backgroundColor: theme.base300 }]}
        showsVerticalScrollIndicator={false}
      >
        {(opensAt || closesAt) && (
          <View style={[styles.submissionWindow, { backgroundColor: theme.base200 }]}>
            <ThemedText style={[styles.submissionLabel, { color: theme.baseContentMuted }]}>
              Submission Window
            </ThemedText>
            <ThemedText style={styles.submissionDates}>
              {opensAt
                ? new Date(opensAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Now"}
              {" – "}
              {closesAt
                ? new Date(closesAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "TBD"}
            </ThemedText>
          </View>
        )}

        <View style={[styles.rulesCard, { backgroundColor: theme.base200 }]}>
          {config.mode.kind === "draft" && (
            <>
              <RuleRow label="Players" value={`${config.mode.numPeople}`} />
              <RuleRow label="Pick clock" value={`${config.mode.pickClockSeconds}s`} />
            </>
          )}
          <RuleRow label="Roster size" value={`${config.numPickSlots} fighters`} />
          {config.selectFrom.kind === "top_fights" && (
            <RuleRow label="Fight pool" value={`Top ${config.selectFrom.number} fights`} />
          )}
          {config.selectFrom.kind === "full_card" && (
            <RuleRow label="Fight pool" value="Full card" />
          )}
          <ScoringSection profile={config.scoringProfile} />
        </View>
      </BottomSheetScrollView>

      {!isDraftActive && (
        <View
          style={[
            styles.footer,
            { backgroundColor: theme.base200, borderTopColor: theme.baseContentExtraMuted },
          ]}
        >
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              if (!joinDraft(gameId)) return;
              onClose();
              router.push("/draft");
            }}
            activeOpacity={0.85}
          >
            <ThemedText style={[styles.joinButtonText, { color: theme.primaryContent }]}>
              + Join draft lobby
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

export const EventGameSheet = forwardRef<BottomSheet, Props>(function EventGameSheet(
  { gameId, gameName: _ },
  ref,
) {
  const { theme } = useAppTheme();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  const handleClose = useCallback(() => {
    (ref as RefObject<BottomSheet>)?.current?.close();
  }, [ref]);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      handleComponent={() => null}
      backgroundStyle={{ backgroundColor: theme.base300 }}
    >
      {gameId && <GameSheetContent gameId={gameId} onClose={handleClose} />}
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  seriesName: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  gameName: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    padding: 14,
    gap: 12,
    flexGrow: 1,
  },
  submissionWindow: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  submissionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  submissionDates: {
    fontSize: 14,
    fontWeight: "600",
  },
  rulesCard: {
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 14,
  },
  ruleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ruleLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  ruleValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  scoringHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  joinButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  joinButtonText: {
    fontWeight: "700",
    fontSize: 17,
  },
});
