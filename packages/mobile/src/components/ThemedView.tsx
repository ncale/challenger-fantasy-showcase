import { View, type ViewProps } from "react-native";
import { useThemeColors } from "~/hooks/use-theme-colors";

const ThemedView = ({ style, ...props }: ViewProps) => {
  const { theme } = useThemeColors();

  return <View style={[{ backgroundColor: theme.base300 }, style]} {...props} />;
};

export default ThemedView;
