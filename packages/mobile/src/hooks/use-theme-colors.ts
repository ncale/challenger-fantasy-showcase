import { colors } from "~/lib/colors";

/** @deprecated use `useAppTheme` instead */
export const useThemeColors = () => {
  return {
    theme: colors.hex.dark,
    opacity: colors.hex.opacity,
  };
};
