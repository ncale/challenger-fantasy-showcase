import { DarkTheme, type Theme } from "@react-navigation/native";

// Constants

const basicPalette = {
  white: "#FFFFFF",
  black: "#000000",
} as const;

const palette = {
  light: {
    base100: "#ffffff",
    base200: "#F9F9F9",
    base300: "#EFEFEF",
    baseContent: "#18181b",
    primary: "#422ad5",
    primaryContent: "#e0e7ff",
    secondary: "#f43098",
    secondaryContent: "#f9e4f0",
    accent: "#00d3bb",
    accentContent: "#084d49",
    neutral: "#09090b",
    neutralContent: "#e4e4e7",
    info: "#00bafe",
    infoContent: "#042e49",
    success: "#00d390",
    successContent: "#004c39",
    warning: "#fcb700",
    warningContent: "#793205",
    error: "#ff627d",
    errorContent: "#4d0218",
  },
  dark: {
    base100: "#24292F",
    base200: "#2A3036",
    base300: "#0B1014",
    baseContent: "#cdcdcd",
    baseContentMuted: "#cdcdcd99",
    baseContentExtraMuted: "#cdcdcd33",
    primary: "#2a7eff",
    primaryContent: "#162455",
    secondary: "#ff8904",
    secondaryContent: "#7c2808",
    accent: "#00c850",
    accentContent: "#022d14",
    neutral: "#09090b",
    neutralContent: "#e4e4e7",
    info: "#00bafe",
    infoContent: "#042e49",
    success: "#01df72",
    successContent: "#022d14",
    warning: "#fcb700",
    warningContent: "#793205",
    error: "#f82834",
    errorContent: "#440607",
    weightClassBlue: "#00b6d9",
    trophyGold: "#fbbf24",
  },
} as const;

const opacity = {
  100: "ff",
  60: "99",
  40: "66",
  30: "4d",
  20: "33",
} as const;

// Exports

export const navigationTheme = {
  dark: true,
  colors: {
    primary: palette.dark.primary,
    background: palette.dark.base300,
    card: palette.dark.base200,
    text: palette.dark.baseContent,
    border: palette.dark.base200,
    notification: palette.dark.error,
  },
  fonts: DarkTheme.fonts,
} satisfies Theme;

export const theme = {
  ...palette.dark,
  ...basicPalette,
};

/** @deprecated transition to using the `theme` const and `AppThemeProvider` */
export const colors = {
  hex: {
    light: {
      ...palette.light,
      baseContentMuted: palette.light.baseContent + opacity[60],
      baseContentExtraMuted: palette.light.baseContent + opacity[20],
      countdownBg: "#0a4a7a",
      firstPlaceBg: "#5c4500",
      rankFirstColor: "#06b6d4",
      rankColor: "#5a8fbf",
      countdownColor: "#f97316",
    },
    dark: {
      ...palette.dark,
      baseContentMuted: palette.dark.baseContent + opacity[60],
      baseContentExtraMuted: palette.dark.baseContent + opacity[20],
      countdownBg: "#1c3d5e",
      firstPlaceBg: "#7a5c00",
      rankFirstColor: "#22d3ee",
      rankColor: "#6b9fd4",
      countdownColor: "#fb923c",
    },
    opacity,
  },
};
