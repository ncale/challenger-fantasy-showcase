import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../ThemedText";

type Route = { key: string; title: string };

type Props = {
  navigationState: { index: number; routes: Route[] };
  onIndexChange: (index: number) => void;
};

export function CustomTabBar({ navigationState, onIndexChange }: Props) {
  const { theme } = useAppTheme();
  const { index, routes } = navigationState;

  return (
    <View style={[styles.tabBar, { borderBottomColor: theme.baseContentExtraMuted }]}>
      {routes.map((route, i) => (
        <Pressable
          key={route.key}
          style={styles.tab}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onIndexChange(i);
          }}
        >
          <ThemedText
            style={[
              styles.tabLabel,
              { color: index === i ? theme.baseContent : theme.baseContentMuted },
            ]}
          >
            {route.title}
          </ThemedText>
          {index === i && (
            <View style={[styles.tabIndicator, { backgroundColor: theme.baseContent }]} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    position: "relative",
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 2,
    borderRadius: 1,
  },
});
