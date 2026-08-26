import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { GlobalProviders } from "../GlobalProviders";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <GlobalProviders>
      <Outlet />
    </GlobalProviders>
  ),
});
