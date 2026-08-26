import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "~/components/ui/sonner";
import { envClient } from "~/lib/env-client";
import { seo } from "~/lib/seo";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...seo({
        title: "Challenger Fantasy",
        description: "Building the future of Fantasy MMA",
        url: "https://ChallengerFantasy.com/",
        image: "https://challengerfantasy.com/og-image.png",
        keywords: "Fantasy MMA, Challenger Fantasy, Challenger Hub",
        twitterHandle: "@ChallengerHub",
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/favicon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
      // { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.png" },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark no-scrollbar">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}

        <Toaster />
        {envClient.MODE === "development" && (
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
              TanStackQueryDevtools,
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  );
}
