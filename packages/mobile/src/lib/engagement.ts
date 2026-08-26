import type { AppConfigResponseDto } from "@challenger-fantasy/schemas";
import { engagementStorage } from "~/lib/storage";

export const AppEvents = {
  userHitMilestone: "user_hit_milestone",
} as const;

export type AppEvent = (typeof AppEvents)[keyof typeof AppEvents];
export type EngagementAction = "show_rating_prompt" | null;

export async function engagementRouter(
  event: AppEvent,
  config: AppConfigResponseDto,
): Promise<EngagementAction> {
  const cooldownMs = config.reviewPromptCooldownDays * 24 * 60 * 60 * 1000;

  const [sessions, hasRated, lastPrompt] = await Promise.all([
    engagementStorage.getSessionCount(),
    engagementStorage.getHasRated(),
    engagementStorage.getLastPromptTime(),
  ]);

  const tooSoon = Date.now() - lastPrompt < cooldownMs;
  if (tooSoon) return null;

  switch (event) {
    case AppEvents.userHitMilestone: {
      if (sessions >= config.reviewPromptMinSessions && !hasRated) {
        await engagementStorage.setLastPromptTime();
        return "show_rating_prompt";
      }
      return null;
    }

    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
