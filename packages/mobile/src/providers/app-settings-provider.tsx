import { DEFAULT_APP_CONFIG } from "@challenger-fantasy/core";
import { LINKS } from "@challenger-fantasy/shared";
import { useSuspenseQueries } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as StoreReview from "expo-store-review";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Linking, Modal, Platform, Pressable, StyleSheet } from "react-native";
import ThemedText from "~/components/ThemedText";
import { AppSettingsContext } from "~/contexts/app-settings-context";
import { type AppEvent, engagementRouter } from "~/lib/engagement";
import { FLAGS, type FlagKey, featureFlagsQuery, getFlag } from "~/lib/flags";
import { appConfigQuery } from "~/lib/init-queries";
import { mobileLogger } from "~/lib/logger";
import { engagementStorage, updatePromptStorage } from "~/lib/storage";
import { useAppTheme } from "./app-theme-provider";

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

async function showRatingPrompt() {
  if (!(await StoreReview.isAvailableAsync())) return;
  await StoreReview.requestReview();
  await engagementStorage.markAsRated();
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { theme } = useAppTheme();
  const [{ data: fetchedAppConfig }, { data: flags }] = useSuspenseQueries({
    queries: [appConfigQuery(), featureFlagsQuery()],
  });

  const appConfig = useMemo(() => {
    return fetchedAppConfig ?? DEFAULT_APP_CONFIG;
  }, [fetchedAppConfig]);

  const [updatePrompt, setUpdatePrompt] = useState<"required" | "optional" | null>(null);
  const currentVersion = Constants.expoConfig?.version ?? "0.0.0";

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    const { minAppVersion, latestAppVersion } = appConfig.ios;

    mobileLogger.lifecycle.debug(
      { currentVersion, minAppVersion, latestAppVersion },
      "Checking app version",
    );

    if (compareVersions(currentVersion, minAppVersion) < 0) {
      setUpdatePrompt("required");
      return;
    }

    if (latestAppVersion && compareVersions(currentVersion, latestAppVersion) < 0) {
      updatePromptStorage.getDismissedLatestVersion().then((dismissed) => {
        if (dismissed !== latestAppVersion) setUpdatePrompt("optional");
      });
    }
  }, [appConfig.ios, currentVersion]);

  const handleDismissPrompt = useCallback(async () => {
    if (updatePrompt === "optional" && appConfig.ios.latestAppVersion) {
      await updatePromptStorage.setDismissedLatestVersion(appConfig.ios.latestAppVersion);
    }
    setUpdatePrompt(null);
  }, [updatePrompt, appConfig.ios.latestAppVersion]);

  const handleOpenStore = useCallback(() => {
    Linking.openURL(LINKS.IOS_STORE_URL);
  }, []);

  const getFlagFn = useCallback((key: FlagKey) => getFlag(flags, key), [flags]);

  const fireEvent = useCallback(
    async (event: AppEvent) => {
      if (!appConfig) return;

      const action = await engagementRouter(event, appConfig);

      switch (action) {
        case "show_rating_prompt":
          if (getFlag(flags, FLAGS.appReviewPrompt)) await showRatingPrompt();
          break;
        case null:
          break;
        default: {
          const _exhaustive: never = action;
          return _exhaustive;
        }
      }
    },
    [flags, appConfig],
  );

  const value = useMemo(
    () => ({
      flags,
      getFlag: getFlagFn,
      fireEvent,
      maintenanceMode: appConfig.maintenanceMode,
      minAppVersion: appConfig.minAppVersion,
      appConfig,
    }),
    [flags, getFlagFn, fireEvent, appConfig],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
      <Modal visible={!!updatePrompt} transparent animationType="fade" statusBarTranslucent>
        <Pressable style={styles.overlay} onPress={handleDismissPrompt}>
          <Pressable style={[styles.card, { backgroundColor: theme.base100 }]}>
            <ThemedText style={styles.title}>
              {updatePrompt === "required" ? "Update Required" : "Update Available"}
            </ThemedText>
            <ThemedText style={[styles.body, { color: theme.baseContentMuted }]}>
              {updatePrompt === "required"
                ? `Version ${appConfig.ios.minAppVersion} or later is required to continue using Challenger.`
                : `Version ${appConfig.ios.latestAppVersion} is available with the latest features and improvements.`}
            </ThemedText>
            <Pressable
              onPress={handleOpenStore}
              style={[styles.button, { backgroundColor: theme.primary }]}
            >
              <ThemedText style={[styles.buttonText, { color: theme.primaryContent }]}>
                Update
              </ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </AppSettingsContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 28,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
