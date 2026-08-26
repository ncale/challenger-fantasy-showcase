import { ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import * as SystemUI from "expo-system-ui";
import type React from "react";
import { createContext, useContext, useEffect } from "react";
import { navigationTheme, theme } from "~/lib/colors";

const AppThemeContext = createContext({ theme });

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  // * This is only needed for builds with old color values saved in app.json
  useEffect(() => {
    // Lock native iOS window to base300 immediately
    SystemUI.setBackgroundColorAsync(theme.base300);
  }, []);

  return (
    <AppThemeContext.Provider value={{ theme }}>
      <NavThemeProvider value={navigationTheme}>{children}</NavThemeProvider>
    </AppThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(AppThemeContext);
