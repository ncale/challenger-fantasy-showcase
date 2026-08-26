import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/login")({
  beforeLoad: () => redirect({ to: "/join" }),
  component: () => null,
});
