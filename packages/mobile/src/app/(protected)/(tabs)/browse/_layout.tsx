import { Stack } from "expo-router";
import { useThemeColors } from "~/hooks/use-theme-colors";

export default function BrowseLayout() {
  const { theme } = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerTintColor: theme.baseContent,
        headerStyle: { backgroundColor: theme.base300 },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="events/[id]/index"
        options={{ animation: "slide_from_right", headerShown: false }}
      />
      <Stack.Screen
        name="events/[id]/pick-ranking"
        options={{ animation: "slide_from_right", headerShown: false }}
      />
    </Stack>
  );
}
