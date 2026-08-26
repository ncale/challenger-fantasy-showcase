import { Tabs } from "expo-router";
import { ListIcon, SparklesIcon, UserIcon } from "lucide-react-native";
import { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusDot } from "~/components/StatusDot";
import ThemedView from "~/components/ThemedView";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { useTrackStatus } from "~/hooks/use-track-status";

function TrackTabIcon({ color, size }: { color: string; size: number }) {
  const { navStatus } = useTrackStatus();

  return (
    <View>
      <ListIcon color={color} size={size} />
      {navStatus && (
        <StatusDot status={navStatus} style={{ position: "absolute", top: -2, right: -4 }} />
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { theme } = useThemeColors();

  return (
    <Suspense
      fallback={
        <ThemedView>
          <ActivityIndicator size="large" color={theme.baseContent} />
        </ThemedView>
      }
    >
      <Tabs
        initialRouteName="browse"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.base300,
            borderTopColor: theme.baseContentExtraMuted,
          },
          tabBarActiveTintColor: theme.baseContent,
          tabBarInactiveTintColor: theme.baseContentMuted,
        }}
      >
        <Tabs.Screen
          name="browse"
          options={{
            title: "Browse",
            tabBarIcon: ({ color, size }) => <SparklesIcon color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="(track)"
          options={{
            title: "Track",
            tabBarIcon: ({ color, size }) => <TrackTabIcon color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} />,
          }}
        />
      </Tabs>
    </Suspense>
  );
}
