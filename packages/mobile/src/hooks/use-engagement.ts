import { useAppSettings } from "~/hooks/use-app-settings";
import { AppEvents } from "~/lib/engagement";

export { AppEvents };

export function useEngagement() {
  return { fireEvent: useAppSettings().fireEvent };
}
