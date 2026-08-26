import { Stack } from "expo-router";
import { View } from "react-native";
import { useFlag } from "~/hooks/use-flag";
import { usePushNotifications } from "~/hooks/use-push-notifications";
import { useSupabase } from "~/hooks/use-supabase";
import { FLAGS } from "~/lib/flags";
import { useAppTheme } from "~/providers/app-theme-provider";
import { DraftRegistryProvider } from "~/providers/draft-registry-provider";
import { DraftSessionProvider } from "~/providers/draft-session-provider";
import { FighterModalProvider } from "~/providers/fighter-modal-provider";
import { UserModalProvider } from "~/providers/user-modal-provider";

export default function ProtectedLayout() {
  return (
    <FighterModalProvider>
      <UserModalProvider>
        <DraftRegistryProvider>
          <DraftSessionProvider>
            <ProtectedContent />
          </DraftSessionProvider>
        </DraftRegistryProvider>
      </UserModalProvider>
    </FighterModalProvider>
  );
}

function ProtectedContent() {
  const { theme } = useAppTheme();
  const { userId } = useSupabase();

  const pushEnabled = useFlag(FLAGS.pushNotifications);
  usePushNotifications(userId, pushEnabled);

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerTintColor: theme.baseContent,
          headerStyle: { backgroundColor: theme.base300 },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ animation: "none", headerShown: false, title: undefined }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            animation: "slide_from_right",
            headerShown: true,
            headerBackButtonDisplayMode: "minimal",
            headerTitle: "Settings",
          }}
        />
        <Stack.Screen
          name="profile/edit-avatar"
          options={{
            animation: "slide_from_right",
            headerShown: true,
            headerBackButtonDisplayMode: "minimal",
            headerTitle: "Profile Picture",
          }}
        />
        <Stack.Screen
          name="profile/edit-username"
          options={{
            animation: "slide_from_right",
            headerShown: true,
            headerBackButtonDisplayMode: "minimal",
            headerTitle: "Username",
          }}
        />
        <Stack.Screen
          name="draft"
          options={{
            animation: "slide_from_bottom",
            animationDuration: 300,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="draft-complete"
          options={{
            animation: "slide_from_bottom",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </View>
  );
}
