import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { useThemeColors } from "~/hooks/use-theme-colors";

type Props = {
  height?: number;
  bottom?: number;
};

export function FabGradient({ height = 140, bottom = 0 }: Props) {
  const { theme } = useThemeColors();
  return (
    <LinearGradient
      colors={["transparent", theme.base300]}
      style={[styles.gradient, { height, bottom }]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
