import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import ThemedText from "~/components/ThemedText";
import { useThemeColors } from "~/hooks/use-theme-colors";

export type GameHeaderGame = {
  name: string;
};

type Props = {
  eventName: string;
  game: GameHeaderGame;
  status?: ReactNode;
};

export const GameHeader = ({ eventName, game, status }: Props) => {
  const { theme } = useThemeColors();
  return (
    <View
      style={[styles.header, { backgroundColor: theme.base200, borderBottomColor: theme.base300 }]}
    >
      <ThemedText style={[styles.eventName, { color: theme.baseContentMuted }]}>
        {eventName}
      </ThemedText>
      <ThemedText style={[styles.gameName, { color: theme.baseContent }]} numberOfLines={2}>
        {game.name}
      </ThemedText>
      {status != null && <View style={styles.statusRow}>{status}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  eventName: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  gameName: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
});
