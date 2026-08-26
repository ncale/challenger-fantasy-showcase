import type { AppConfigResponseDto } from "@challenger-fantasy/schemas";
import { createContext } from "react";
import type { AppEvent } from "~/lib/engagement";
import type { FlagKey } from "~/lib/flags";

export interface AppSettingsContextValue {
  flags: Record<string, boolean>;
  getFlag: (key: FlagKey) => boolean;
  fireEvent: (event: AppEvent) => Promise<void>;
  maintenanceMode: boolean;
  minAppVersion: string;
  appConfig: AppConfigResponseDto;
}

export const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);
