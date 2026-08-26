import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/events", search: { tab: "upcoming" } });
  }, [navigate]);

  return null;
}
