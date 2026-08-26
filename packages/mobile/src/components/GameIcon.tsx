import type { GameDto } from "@challenger-fantasy/schemas";
import { StyleSheet, View } from "react-native";
import Icon1 from "~/assets/icons/green_icon1_one_dot.svg";
import Icon2 from "~/assets/icons/green_icon2_two_dots.svg";
import Icon3 from "~/assets/icons/green_icon3_triangle.svg";
import Icon4 from "~/assets/icons/green_icon4_square.svg";
import { useAppTheme } from "~/providers/app-theme-provider";

const getModeKey = (mode: GameDto["config"]["mode"]) => {
  if (mode.kind === "solo") return "solo";
  if (mode.numPeople === 2) return "two";
  if (mode.numPeople === 3) return "three";
  return "four";
};

// FIX
// The GameDtoSchema has a .coerce.date().optional() schema for submissionWindow. When fetching this
// DTO from the API, it is returned as a string, which isn't accepted elsewhere because the type expects
// `Date | undefined`. This is a quick fix to make this accept games without TS errors.
type FixedGameDto = Omit<GameDto, "config" | "metadata"> & {
  config: Omit<GameDto["config"], "submissionWindow"> & {
    submissionWindow?: unknown;
  };
  metadata: Omit<GameDto["metadata"], "submissionWindow"> & {
    iconColor?: string;
  };
};

export const GameIcon = ({ game }: { game: FixedGameDto }) => {
  const { theme } = useAppTheme();

  const Icon = {
    solo: Icon1,
    two: Icon2,
    three: Icon3,
    four: Icon4,
  }[getModeKey(game.config.mode)];

  const iconColor = game.metadata.iconColor ?? theme.accent;

  return (
    <View style={styles.wrapper}>
      <Icon width={28} height={28} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  image: {
    width: 28,
    height: 28,
  },
});
