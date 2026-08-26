import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Sentry from "@sentry/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { type ErrorBoundaryProps, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Pressable, StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MaintenanceScreen } from "~/components/MaintenanceScreen";
import { NetworkBanner } from "~/components/NetworkBanner";
import { QueryLogger } from "~/components/QueryLogger";
import ThemedText from "~/components/ThemedText";
import ThemedView from "~/components/ThemedView";
import { useAppSettings } from "~/hooks/use-app-settings";
import { useNotificationNavigation } from "~/hooks/use-push-notifications";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { PostHogProvider, posthogConfig } from "~/lib/posthog";
import { queryClient } from "~/lib/query-client";
import { engagementStorage } from "~/lib/storage";
import { AppSettingsProvider } from "~/providers/app-settings-provider";
import { AppThemeProvider } from "~/providers/app-theme-provider";
import { NetworkStatusProvider } from "~/providers/network-status-provider";
import { SupabaseProvider } from "~/providers/supabase-provider";

Sentry.init({
  dsn: "https://6ab44afb1c8d802349a8af90dc68b150@o4511214875312128.ingest.us.sentry.io/4511232464191488",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

SplashScreen.preventAutoHideAsync();

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { theme } = useThemeColors();
  return (
    <ThemedView style={errorStyles.container}>
      <ThemedText style={errorStyles.title}>Something went wrong</ThemedText>
      <ThemedText style={[errorStyles.message, { color: theme.baseContentMuted }]}>
        {error.message}
      </ThemedText>
      <Pressable
        onPress={retry}
        style={() => [errorStyles.button, { backgroundColor: theme.primary }]}
      >
        <ThemedText style={[errorStyles.buttonText, { color: theme.primaryContent }]}>
          Try again
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 100,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default Sentry.wrap(function RootLayout() {
  const { theme } = useThemeColors();

  useEffect(() => {
    engagementStorage.incrementSessionCount();
  }, []);

  return (
    <AppThemeProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.base300 }}>
        <StatusBar translucent={false} />
        <PostHogProvider apiKey={posthogConfig.apiKey} options={posthogConfig.options}>
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <AppSettingsProvider>
                <NetworkStatusProvider>
                  <SupabaseProvider>
                    <RootNavigator />

                    {/* Components Mounted Globally */}
                    <NetworkBanner />
                    <QueryLogger />
                  </SupabaseProvider>
                </NetworkStatusProvider>
              </AppSettingsProvider>
            </BottomSheetModalProvider>
          </QueryClientProvider>
        </PostHogProvider>
      </GestureHandlerRootView>
    </AppThemeProvider>
  );
});

function RootNavigator() {
  const { session, isLoaded, isProfileLoading, profile } = useSupabase();
  const { maintenanceMode } = useAppSettings();
  const { theme } = useThemeColors();

  const isReady = isLoaded && (!session || !isProfileLoading);
  const hasUsername = !!profile?.username;

  useNotificationNavigation();

  useEffect(() => {
    if (isReady || maintenanceMode) {
      SplashScreen.hideAsync();
    }
  }, [isReady, maintenanceMode]);

  if (maintenanceMode) {
    return <MaintenanceScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: "none",
        animationDuration: 0,
        contentStyle: { backgroundColor: theme.base300 },
      }}
    >
      <Stack.Protected guard={!!session && hasUsername}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>

      <Stack.Protected guard={!!session && !isProfileLoading && !hasUsername}>
        <Stack.Screen name="set-username" />
      </Stack.Protected>

      <Stack.Protected guard={!!session && isProfileLoading}>
        <Stack.Screen name="loading" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>
    </Stack>
  );
}
