import { QueryClientProvider } from "@tanstack/react-query";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import type { PropsWithChildren } from "react";
import { env } from "./lib/env";
import { queryClient } from "./lib/query-client";

posthog.init(env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: "2025-05-24",
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking
  debug: env.DEV,
  // cookieless_mode: "on_reject",
  // autocapture: false,
});

export const GlobalProviders = ({ children }: PropsWithChildren) => {
  return (
    <PostHogProvider client={posthog}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PostHogProvider>
  );
};
