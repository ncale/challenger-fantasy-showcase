import { Text, type TextProps } from "react-native";
import { useThemeColors } from "~/hooks/use-theme-colors";

interface ThemedTextProps extends TextProps {
  opacity?: 100 | 60 | 40 | 30;
}

const ThemedText = ({ style, opacity = 100, ...props }: ThemedTextProps) => {
  const { theme, opacity: opacityValues } = useThemeColors();

  return <Text style={[{ color: theme.baseContent + opacityValues[opacity] }, style]} {...props} />;
};

export default ThemedText;
