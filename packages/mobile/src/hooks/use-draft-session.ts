import { useContext } from "react";
import { DraftSessionContext } from "~/contexts/draft-session-context";

export function useDraftSession() {
  const ctx = useContext(DraftSessionContext);
  if (!ctx) throw new Error("useDraftSession must be used within a DraftSessionProvider");
  return ctx;
}
