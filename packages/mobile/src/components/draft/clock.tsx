import { formatTime, isNullish } from "@challenger-fantasy/core";
import { router } from "expo-router";
import { MoreHorizontalIcon, XIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { useDraftClock } from "~/hooks/use-draft-clock";
import { useDraftSession } from "~/hooks/use-draft-session";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../ThemedText";

interface ClockProps {
  style?: StyleProp<ViewStyle>;
  onOpenOptions?: () => void;
}

export function Clock({ style, onOpenOptions }: ClockProps) {
  const { theme } = useAppTheme();
  const { draftState, draftStatusLabel } = useDraftSession();

  const { secondsRemaining } = useDraftClock(draftState);

  if (isNullish(draftState)) return null;

  const isActive = draftState.status === "in-progress";
  const isSpinning = draftState.status === "initializing" || draftState.status === "pending";
  const timerColor = isActive ? theme.success : theme.baseContentMuted;

  return (
    <View style={[styles.container, { backgroundColor: theme.base300 }, style]}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
        <XIcon size={24} color={theme.baseContent} />
      </Pressable>

      <View style={styles.center}>
        <View style={styles.timer}>
          <ThemedText style={[styles.timerText, { color: timerColor }]}>
            {isActive ? formatTime(secondsRemaining) : "00:00"}
          </ThemedText>
        </View>

        {isSpinning ? (
          <View style={styles.statusRow}>
            <ActivityIndicator
              size="small"
              color={isActive ? theme.success : theme.baseContentMuted}
            />
            <ThemedText style={[styles.statusText, { color: theme.baseContentMuted }]}>
              {draftStatusLabel}
            </ThemedText>
          </View>
        ) : (
          <ThemedText
            style={[styles.statusText, { color: theme.baseContentMuted }]}
            numberOfLines={1}
          >
            {draftStatusLabel}
          </ThemedText>
        )}
      </View>

      {onOpenOptions ? (
        <Pressable onPress={onOpenOptions} hitSlop={12} style={styles.iconButton}>
          <MoreHorizontalIcon size={24} color={theme.baseContent} />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 12,
  },
  iconButton: {
    padding: 2,
    width: 28,
  },
  center: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  timer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "left",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
