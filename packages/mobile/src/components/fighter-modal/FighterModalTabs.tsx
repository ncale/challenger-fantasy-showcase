import { Pressable, StyleSheet, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../ThemedText";

export type ModalTab = {
  id: string;
  label: string;
};

type Props = {
  tabs: ModalTab[];
  activeId: string;
  onPress: (id: string) => void;
};

export function FighterModalTabs({ tabs, activeId, onPress }: Props) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.baseContentExtraMuted }]}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable key={tab.id} onPress={() => onPress(tab.id)} style={styles.tab}>
            <ThemedText
              style={[
                styles.label,
                { color: isActive ? theme.baseContent : theme.baseContentMuted },
              ]}
            >
              {tab.label}
            </ThemedText>
            {isActive && (
              <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 0,
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
    paddingBottom: 10,
  },
  activeIndicator: {
    height: 2,
    width: "100%",
    borderRadius: 1,
  },
});
