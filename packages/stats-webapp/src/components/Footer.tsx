import { LINKS, SITE_CONTENT } from "@challenger-fantasy/core";
import { Mail } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Discord } from "./Icons/Discord";
import { Instagram } from "./Icons/Instagram";

export const Footer = () => {
  const posthog = usePostHog();

  return (
    <footer className="bg-sidebar text-sidebar-foreground shadow-sm border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-36 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Column - Copyright */}
          <div className="md:col-span-2 space-y-2">
            <p className="text-sm">{SITE_CONTENT.FOOTER.COPYRIGHT_TEXT}</p>
            <p className="text-xs text-muted-foreground">{SITE_CONTENT.FOOTER.COPYRIGHT_SUBTEXT}</p>
          </div>

          {/* Legal Links */}
          <div className="space-y-2">
            <p className="text-sm font-medium mb-3">Legal</p>
            <div className="flex flex-col space-y-2 text-sm">
              <a
                href={LINKS.PRIVACY}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent-foreground transition-colors w-fit"
                onClick={() => {
                  posthog.capture("privacy_policy_click", { location: "footer" });
                }}
              >
                Privacy Policy
              </a>
              <a
                href={LINKS.TOS}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent-foreground transition-colors w-fit"
                onClick={() => {
                  posthog.capture("terms_of_service_click", { location: "footer" });
                }}
              >
                Terms of Service
              </a>
            </div>
          </div>

          {/* Resources Links */}
          {/* <div className="space-y-2">
            <p className="text-sm font-medium mb-3">Resources</p>
            <div className="flex flex-col space-y-2 text-sm">
              <a
                href={LINKS.CHANGELOG}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent-foreground transition-colors w-fit"
                onClick={() => {
                  posthog.capture("changelog_click", { location: "footer" });
                }}
              >
                Changelog
              </a>
            </div>
          </div> */}

          {/* Right Column - Social Links */}
          <div>
            <p className="text-sm font-medium mb-3">Connect</p>
            <div className="flex space-x-3">
              <a
                href={LINKS.DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent-foreground transition-colors"
                onClick={() => {
                  posthog.capture("discord_click", { location: "footer" });
                }}
              >
                <Discord />
                <span className="sr-only">Discord</span>
              </a>
              {/* <a
                href={LINKS.TWITTER}
								target="_blank"
								rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent-foreground transition-colors"
                onClick={() => {
                  posthog.capture("x_click", { location: "footer" });
                }}
              >
                <X />
                <span className="sr-only">X</span>
              </a> */}
              <a
                href={LINKS.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent-foreground transition-colors"
                onClick={() => {
                  posthog.capture("instagram_click", { location: "footer" });
                }}
              >
                <Instagram />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href={LINKS.CONTACT_EMAIL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent-foreground transition-colors"
                onClick={() => {
                  posthog.capture("email_click", { location: "footer" });
                }}
              >
                <Mail className="size-4" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
