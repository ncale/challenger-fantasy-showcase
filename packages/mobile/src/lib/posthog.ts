import { env } from "./env";

export { PostHogProvider, usePostHog } from "posthog-react-native";

export const posthogConfig = {
  apiKey: env.EXPO_PUBLIC_POSTHOG_KEY ?? "",
  options: {
    host: env.EXPO_PUBLIC_POSTHOG_URL ?? "https://us.i.posthog.com",
    // Disable entirely if no key is configured (e.g. local dev without .env)
    disabled: !env.EXPO_PUBLIC_POSTHOG_KEY,
    // Capture screen views automatically via React Navigation
    captureMode: "manual" as const,
  },
};

// Typed event catalogue — add new events here as the app grows
export type AnalyticsEvents = {
  draft_completed: { game_id: string };
  game_joined: { game_id: string };
  submission_viewed: { submission_id: string };
  push_permission_requested: Record<string, never>;
  push_permission_granted: Record<string, never>;
  push_permission_denied: Record<string, never>;
  rating_prompted: Record<string, never>;
  onboarding_completed: Record<string, never>;
  onboarding_skipped: Record<string, never>;
};
