import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  dismissedLatestVersion: "@update-prompt/dismissed_latest_version",
} as const;

export const updatePromptStorage = {
  getDismissedLatestVersion: async (): Promise<string | null> =>
    AsyncStorage.getItem(KEYS.dismissedLatestVersion),
  setDismissedLatestVersion: async (version: string): Promise<void> => {
    await AsyncStorage.setItem(KEYS.dismissedLatestVersion, version);
  },
};
