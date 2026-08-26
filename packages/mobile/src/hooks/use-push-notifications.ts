import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { mobileLogger } from "~/lib/logger";
import { pushStorage } from "~/lib/storage";
import { supabase } from "~/lib/supabase";

// Controls how notifications behave when the app is in the foreground.
// Must be set before any notification is received — module level ensures this.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;

// --- Token registration ---

export function usePushNotifications(userId: string | undefined, enabled = true) {
  useEffect(() => {
    if (!enabled || !userId) return;
    registerForPushTokenSilently(userId);
  }, [userId, enabled]);
}

async function registerForPushTokenSilently(userId: string) {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    mobileLogger.lifecycle.debug({ status }, "push.token.skip");
    return;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });

    const lastSaved = await pushStorage.getLastToken();
    if (token === lastSaved) {
      mobileLogger.lifecycle.debug({}, "push.token.unchanged");
      return;
    }

    await supabase.from("user_account").update({ expo_push_token: token }).eq("user_id", userId);
    await pushStorage.setLastToken(token);
    mobileLogger.lifecycle.info({}, "push.token.register");
  } catch (err) {
    mobileLogger.lifecycle.debug(
      { error: err instanceof Error ? err.message : String(err) },
      "push.token.error",
    );
  }
}

// --- Permission request (called by engagement router) ---

export async function requestPushPermissionAndRegister(userId: string | undefined) {
  if (!userId) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") {
    mobileLogger.lifecycle.debug({}, "push.permission.already-granted");
    return;
  }

  mobileLogger.lifecycle.info({}, "push.permission.request");
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    mobileLogger.lifecycle.warn({ status }, "push.permission.deny");
    return;
  }

  mobileLogger.lifecycle.info({}, "push.permission.grant");
  await registerForPushTokenSilently(userId);
}

// --- Notification tap navigation ---

// Notification payloads should include { url: string } matching an Expo Router path.
// Route groups and /index suffixes are stripped — use the clean path:
//   Game detail:     { url: "/games/abc123" }
//   Submission:      { url: "/submissions/xyz789" }
//   Live tracking:   { url: "/track/live" }
export function useNotificationNavigation() {
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!lastResponse) return;
    const url = lastResponse.notification.request.content.data?.url;
    if (typeof url === "string") {
      mobileLogger.lifecycle.info({ url }, "push.notification.tap");
      router.push(url as never);
    }
  }, [lastResponse, router]);
}
