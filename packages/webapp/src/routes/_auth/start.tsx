import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/start")({
  beforeLoad: () => redirect({ to: "/join" }),
  component: () => null,
});
