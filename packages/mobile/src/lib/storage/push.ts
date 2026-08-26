import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  lastToken: "@push/last_token",
  pushAsked: "@push/push_asked",
} as const;

export const pushStorage = {
  getLastToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(KEYS.lastToken);
  },
  setLastToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(KEYS.lastToken, token);
  },
  hasAskedForPushPermission: async (): Promise<boolean> => {
    return (await AsyncStorage.getItem(KEYS.pushAsked)) === "true";
  },
  markPushPermissionAsked: async (): Promise<void> => {
    await AsyncStorage.setItem(KEYS.pushAsked, "true");
  },
};
