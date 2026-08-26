import { useContext } from "react";
import { FighterModalContext } from "~/contexts/fighter-modal-context";

export function useFighterModal() {
  const ctx = useContext(FighterModalContext);
  // Graceful fallback when used outside the provider
  return ctx ?? { openFighter: (_fighterId: string) => {} };
}
