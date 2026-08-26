import { useContext } from "react";
import { DraftContext } from "~/contexts/draft-context";

export const useDraft = () => {
  const draftContext = useContext(DraftContext);
  if (!draftContext) {
    throw new Error("useDraft must be used within a DraftProvider");
  }
  return draftContext;
};
