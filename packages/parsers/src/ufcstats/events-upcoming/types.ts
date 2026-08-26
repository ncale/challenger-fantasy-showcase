import type { LocationParsed } from "../../common.ts";

export interface UpcomingEventsParseResult {
  events: {
    externalId: string;
    name: string;
    eventDateIso: string | null;
    location: LocationParsed;
  }[];
}
