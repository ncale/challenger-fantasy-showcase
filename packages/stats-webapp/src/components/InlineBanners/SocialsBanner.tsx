import { LINKS } from "@challenger-fantasy/core";
import { X } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export function SocialsBanner() {
  const isVisible = true;
  const setVisibility = (state: "visible" | "hidden") => {
    // Placeholder function to mimic visibility setting
  };
  // const { isVisible, setVisibility } = useSocialsBannerVisibility();

  const posthog = usePostHog();

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative bg-primary text-primary-foreground px-4 py-3 rounded-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-medium">
            Follow us on{" "}
            <a
              href={LINKS.INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
              onClick={() =>
                posthog.capture("social_link_banner_click", {
                  platform: "instagram",
                })
              }
            >
              Instagram
            </a>{" "}
            and join our{" "}
            <a
              href={LINKS.DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
              onClick={() =>
                posthog.capture("social_link_banner_click", {
                  platform: "discord",
                })
              }
            >
              Discord
            </a>{" "}
            community for the latest updates and discussions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setVisibility("hidden")}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            aria-label="Close banner"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
