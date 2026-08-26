import { useAppSettings } from "~/hooks/use-app-settings";
import type { FlagKey } from "~/lib/flags";

export function useFlag(key: FlagKey): boolean {
  return useAppSettings().getFlag(key);
}
