import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@onboarding/has_seen";

export const onboardingStorage = {
  hasSeenOnboarding: async (): Promise<boolean> => {
    return (await AsyncStorage.getItem(KEY)) === "true";
  },
  markOnboardingComplete: async (): Promise<void> => {
    await AsyncStorage.setItem(KEY, "true");
  },
};
