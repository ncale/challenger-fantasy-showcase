import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";

// * Option to add general status types like "info", "attention", and "urgent"
// * (eg. `"info" | "attention" | "urgent"`) in addition to the domain-specific "active-draft" statuses.
// * This would allow the StatusDot component to be reused in other contexts.

export type StatusType = "active-draft" | "live";

function getStatusColor(
  status: StatusType,
  theme: { success: string; info: string; warning: string; error: string },
): string {
  switch (status) {
    case "active-draft":
      return theme.warning;
    case "live":
      return theme.success;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

interface StatusDotProps {
  status: StatusType;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function StatusDot({ status, size = 9, style }: StatusDotProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getStatusColor(status, theme),
        },
        style,
      ]}
    />
  );
}
