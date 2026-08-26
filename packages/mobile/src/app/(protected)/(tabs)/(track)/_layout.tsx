import { Stack } from "expo-router";
import { useAppTheme } from "~/providers/app-theme-provider";

export default function TrackStackLayout() {
  const { theme } = useAppTheme();

  return (
    <Stack
      initialRouteName="track"
      screenOptions={{
        headerTintColor: theme.baseContent,
        headerStyle: { backgroundColor: theme.base300 },
      }}
    >
      <Stack.Screen name="track" options={{ headerShown: false }} />
      <Stack.Screen
        name="live"
        options={{
          animation: "slide_from_right",
          headerShown: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Live",
        }}
      />
      <Stack.Screen
        name="upcoming"
        options={{
          animation: "slide_from_right",
          headerShown: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Upcoming",
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          animation: "slide_from_right",
          headerShown: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Results",
        }}
      />
      <Stack.Screen
        name="events/[id]/index"
        options={{ animation: "slide_from_right", headerShown: false }}
      />
      <Stack.Screen
        name="submissions/[id]/index"
        options={{ animation: "slide_from_right", headerShown: false }}
      />
    </Stack>
  );
}
