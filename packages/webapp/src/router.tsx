import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { DefaultCatchBoundary } from "./components/pages/default-catch-boundary";
import { NotFound } from "./components/pages/not-found";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,
    context: { ...rqContext },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultNotFoundComponent: () => <NotFound />,
    defaultErrorComponent: (props) => <DefaultCatchBoundary {...props} />,
    Wrap: (props: { children: React.ReactNode }) => {
      return <TanstackQuery.Provider {...rqContext}>{props.children}</TanstackQuery.Provider>;
    },
  });

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
