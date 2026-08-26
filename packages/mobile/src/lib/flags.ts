export { featureFlagsQuery } from "./init-queries";

export const FLAGS = {
  pushNotifications: "push_notifications",
  appReviewPrompt: "app_review_prompt",
  onboarding: "onboarding",
} as const;

export type FlagKey = (typeof FLAGS)[keyof typeof FLAGS];

export function getFlag(flags: Record<string, boolean>, key: FlagKey): boolean {
  return flags[key] ?? false;
}
