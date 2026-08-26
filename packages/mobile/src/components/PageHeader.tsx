import { router } from "expo-router";
import { ChevronLeftIcon, MoreHorizontalIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "~/hooks/use-theme-colors";
import ThemedText from "./ThemedText";

type Props = {
  children?: ReactNode;
  title?: string;
  showSettings?: boolean;
  onSettingsPress?: () => void;
  backgroundColor?: string;
};

export function PageHeader({
  children,
  title,
  showSettings,
  onSettingsPress,
  backgroundColor,
}: Props) {
  const { top } = useSafeAreaInsets();
  const { theme } = useThemeColors();
  const bg = backgroundColor ?? theme.base200;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: top,
          backgroundColor: bg,
          borderBottomColor: theme.base300,
        },
      ]}
    >
      <View style={styles.navRow}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navSide}>
          <ChevronLeftIcon size={24} color={theme.baseContent} />
        </Pressable>

        {title && (
          <ThemedText style={[styles.navTitle, { color: theme.baseContent }]} numberOfLines={1}>
            {title}
          </ThemedText>
        )}

        {showSettings ? (
          <Pressable onPress={onSettingsPress} hitSlop={8} style={styles.navSide}>
            <MoreHorizontalIcon size={24} color={theme.baseContent} />
          </Pressable>
        ) : (
          <View style={styles.navSide} />
        )}
      </View>
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
  },
  navSide: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 2,
  },
});
