import type { ReactNode } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";

type Props = {
  onPress: () => void;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  size?: number;
  /** Background when active. Defaults to theme.primary. */
  color?: string;
  /** Background when inactive. Defaults to theme.base200. */
  inactiveColor?: string;
  accessibilityLabel?: string;
};

export function CircleButton({
  onPress,
  icon,
  active = false,
  disabled = false,
  size = 32,
  color,
  inactiveColor,
  accessibilityLabel,
}: Props) {
  const { theme } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: active ? (color ?? theme.primary) : (inactiveColor ?? theme.base200),
          opacity: disabled ? 0.3 : 1,
        },
        styles.btn,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
  },
});
