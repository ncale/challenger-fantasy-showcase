import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/events")({
  staticData: { breadcrumb: "Events" },
});
