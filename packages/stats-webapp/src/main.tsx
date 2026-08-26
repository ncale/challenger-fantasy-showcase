import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import { isNullish } from "@challenger-fantasy/core";
import { queryClient } from "./lib/query-client";

// Create a new router instance
const router = createRouter({ routeTree, context: { queryClient }, defaultPreload: "intent" });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface StaticDataRouteOption {
    breadcrumb?: string;
    // biome-ignore lint/suspicious/noExplicitAny: not sure how to define static data routes so they pass through this info for breadcrumbs
    getTitle?: (data: any) => string;
  }
}

const root = document.getElementById("root");
if (isNullish(root)) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
