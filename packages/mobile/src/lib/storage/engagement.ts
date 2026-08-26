import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  sessionCount: "@engagement/session_count",
  hasRated: "@engagement/has_rated",
  lastPromptTime: "@engagement/last_prompt_time",
} as const;

export const engagementStorage = {
  getSessionCount: async (): Promise<number> => {
    const raw = await AsyncStorage.getItem(KEYS.sessionCount);
    return raw ? Number.parseInt(raw, 10) : 0;
  },
  incrementSessionCount: async (): Promise<number> => {
    const raw = await AsyncStorage.getItem(KEYS.sessionCount);
    const next = (raw ? Number.parseInt(raw, 10) : 0) + 1;
    await AsyncStorage.setItem(KEYS.sessionCount, String(next));
    return next;
  },
  getHasRated: async (): Promise<boolean> => {
    return (await AsyncStorage.getItem(KEYS.hasRated)) === "true";
  },
  markAsRated: async (): Promise<void> => {
    await AsyncStorage.setItem(KEYS.hasRated, "true");
  },
  getLastPromptTime: async (): Promise<number> => {
    const raw = await AsyncStorage.getItem(KEYS.lastPromptTime);
    return raw ? Number.parseInt(raw, 10) : 0;
  },
  setLastPromptTime: async (): Promise<void> => {
    await AsyncStorage.setItem(KEYS.lastPromptTime, String(Date.now()));
  },
};
