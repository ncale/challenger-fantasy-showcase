import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/sign-up")({
  beforeLoad: () => redirect({ to: "/join" }),
  component: () => null,
});
