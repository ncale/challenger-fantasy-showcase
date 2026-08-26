import { useContext } from "react";
import { DraftRegistryContext } from "~/contexts/draft-registry-context";

export function useDraftRegistry() {
  const ctx = useContext(DraftRegistryContext);
  if (!ctx) throw new Error("useDraftRegistry must be used within a DraftRegistryProvider");
  return ctx;
}
