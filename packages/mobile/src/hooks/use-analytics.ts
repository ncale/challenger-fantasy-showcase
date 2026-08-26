import { usePostHog } from "posthog-react-native";
import type { AnalyticsEvents } from "~/lib/posthog";

// Returns a typed track() function scoped to the AnalyticsEvents catalogue
export function useAnalytics() {
  const posthog = usePostHog();

  function track<E extends keyof AnalyticsEvents>(
    event: E,
    ...args: AnalyticsEvents[E] extends Record<string, never>
      ? []
      : [properties: AnalyticsEvents[E]]
  ) {
    posthog?.capture(event, args[0]);
  }

  return { track };
}
