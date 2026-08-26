import { useContext } from "react";
import { DemoDraftContext } from "~/contexts/demo-draft-context";

export function useDemoDraft() {
  const ctx = useContext(DemoDraftContext);
  if (!ctx) throw new Error("useDemoDraft must be used within DemoDraftProvider");
  return ctx;
}
