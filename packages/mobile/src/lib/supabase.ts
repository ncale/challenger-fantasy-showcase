import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { env } from "./env";
import "react-native-url-polyfill/auto";
import type { Database } from "@challenger-fantasy/types";

// Check if we're on the client side (not SSR)
const isClient = typeof window !== "undefined";

const ExpoWebSecureStoreAdapter = {
  getItem: (key: string) => {
    if (!isClient) return Promise.resolve(null);
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (!isClient) return Promise.resolve();
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (!isClient) return Promise.resolve();
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient<Database>(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: ExpoWebSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Platform.OS === "web",
      lock: processLock,
    },
  },
);
