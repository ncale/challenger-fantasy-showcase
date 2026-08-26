import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ChevronRight } from "lucide-react-native";
import { forwardRef, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "./ThemedText";

type SettingsItem = {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  iconColor?: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export type SettingsSection = {
  title?: string;
  items: SettingsItem[];
};

type Props = {
  sections: SettingsSection[];
};

export const SettingsSheet = forwardRef<BottomSheetModal, Props>(({ sections }, ref) => {
  const { theme } = useAppTheme();
  const { bottom } = useSafeAreaInsets();
  const sheetRef = ref as React.RefObject<BottomSheetModal>;

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.7} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.transparentBackground}
      handleComponent={null}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: bottom + 12 }]}>
        <View style={[styles.group, { backgroundColor: theme.base200 }]}>
          {sections
            .flatMap((section) => section.items)
            .map((item, ii, all) => {
              const iconColor = item.destructive
                ? theme.error
                : (item.iconColor ?? theme.baseContent);
              const labelColor = item.destructive ? theme.error : theme.baseContent;
              const isLast = ii === all.length - 1;
              return (
                <View key={item.label}>
                  <Pressable
                    style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
                    onPress={item.onPress}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: iconColor + "20" }]}>
                      <item.icon size={16} color={iconColor} strokeWidth={2.2} />
                    </View>
                    <ThemedText style={[styles.label, { color: labelColor }]}>
                      {item.label}
                    </ThemedText>
                    <ChevronRight size={16} color={theme.baseContentMuted} />
                  </Pressable>
                  {!isLast && (
                    <View
                      style={[styles.divider, { backgroundColor: theme.base300, marginLeft: 54 }]}
                    />
                  )}
                </View>
              );
            })}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.doneButton,
            { backgroundColor: theme.base200, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => sheetRef.current?.dismiss()}
        >
          <ThemedText style={[styles.doneLabel, { color: theme.baseContent }]}>Done</ThemedText>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

SettingsSheet.displayName = "SettingsSheet";

const styles = StyleSheet.create({
  transparentBackground: {
    backgroundColor: "transparent",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 10,
  },
  group: {
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  doneButton: {
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  doneLabel: {
    fontSize: 17,
    fontWeight: "600",
  },
});
