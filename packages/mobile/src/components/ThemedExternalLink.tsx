import type React from "react";
import { Linking, Text } from "react-native";
import { useThemeColors } from "~/hooks/use-theme-colors";

const ThemedExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const { theme } = useThemeColors();

  return (
    <Text onPress={() => Linking.openURL(href)} style={{ color: theme.primary }}>
      {children}
    </Text>
  );
};

export default ThemedExternalLink;
