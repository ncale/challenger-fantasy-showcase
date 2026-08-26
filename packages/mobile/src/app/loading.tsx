import { View } from "react-native";
import { useThemeColors } from "~/hooks/use-theme-colors";

export default function LoadingScreen() {
  const { theme } = useThemeColors();
  return <View style={{ flex: 1, backgroundColor: theme.base200 }} />;
}
