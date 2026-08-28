import { slugify } from "../../../data/utils";
import {
  $,
  $$,
  defined,
  extractExternalId,
  parseEventDateToIso,
  parseLocation,
  txt,
} from "../../common.ts";
import type { UpcomingEventsParseResult } from "./types.ts";

/**
 * Parse the UFC upcoming events page to extract a list of future events.
 *
 * The page contains a table of upcoming UFC events with:
 * - Event names and links
 * - Event dates
 * - Event locations
 *
 * This parser extracts all upcoming events with their basic information.
 */
export function parseUfcstatsEventsUpcomingPage(document: Document): UpcomingEventsParseResult {
  const eventRows = $$(document, "table.b-statistics__table-events tr.b-statistics__table-row");
  const events: UpcomingEventsParseResult["events"] = [];

  eventRows.forEach((row) => {
    const cells = $$(row, "td");
    if (cells.length === 0) return; // Skip header rows

    // Look for event link in the first cell
    const eventLink = $(cells[0], "a.b-link") as HTMLAnchorElement;
    if (!eventLink) return; // Skip rows without event links

    const name = txt(eventLink);
    if (!name) return; // Skip empty event names

    const externalId = extractExternalId(eventLink.href) || slugify(name);

    // Extract date from the same cell (it's usually below the event name)
    const dateText = txt(cells[0]);
    // Extract date by looking for date pattern after the event name
    const dateMatch = dateText.match(/([A-Za-z]+ \d{1,2}, \d{4})/);
    const dateStr = dateMatch ? defined(dateMatch[1]) : "";
    const eventDateIso = dateStr ? parseEventDateToIso(dateStr) : null;

    // Extract location from second cell if it exists, otherwise try to find it in first cell
    let locationRaw = "";
    if (cells[1]) {
      locationRaw = txt(cells[1]);
    } else {
      // Try to extract location from the first cell if it's all in one cell
      const locationMatch = dateText.match(/([A-Za-z ,]+(?:, [A-Z]{2,})?(?:, [A-Za-z ]+)?)$/);
      locationRaw = locationMatch ? defined(locationMatch[1]).trim() : "";
    }

    const location = parseLocation(locationRaw);

    events.push({
      externalId,
      name,
      eventDateIso,
      location,
    });
  });

  return { events };
}
