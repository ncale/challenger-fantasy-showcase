import { Stack } from "expo-router";
import { useThemeColors } from "~/hooks/use-theme-colors";

export default function PublicLayout() {
  const { theme } = useThemeColors();
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerTintColor: theme.baseContent,
        headerStyle: { backgroundColor: theme.base300 },
        contentStyle: { backgroundColor: theme.base300 },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen
        name="email"
        options={{
          title: "Get started",
          headerTitleStyle: { color: theme.baseContent },
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="otp"
        options={{
          title: "Verify your email",
          headerTitleStyle: { color: theme.baseContent },
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </Stack>
  );
}
