import {
  $,
  $$,
  type DateParsed,
  extractExternalId,
  type LocationParsed,
  parseEventDateStructured,
  parseLocation,
  parseWeightClass,
  txt,
  type WinnerString,
} from "../../common.ts";
import type { EventParseResult, FighterParsed, FightParsed } from "./types.ts";

function extractFights(document: Document): FightParsed[] {
  const fightRows = $$(
    document,
    "table.b-fight-details__table tbody tr.b-fight-details__table-row",
  );

  const results = fightRows.map((row) => {
    // Skip empty rows
    const cells = $$(row, "td");
    if (cells.length < 2) return null;

    // Extract fight external ID
    const onclickAttr = row.getAttribute("onclick") || "";
    const dataLink = row.getAttribute("data-link") || "";
    const fightUrl = onclickAttr.match(/doNav\('([^']+)'\)/)?.[1] || dataLink;
    const fightExternalId = extractExternalId(fightUrl);

    // Extract fighters
    const fighterLinks = $$(cells[1], "a.b-link");
    if (fighterLinks.length < 2) return null;

    const fighter1Link = fighterLinks[0] as HTMLAnchorElement;
    const fighter2Link = fighterLinks[1] as HTMLAnchorElement;

    const fighter1: FighterParsed = {
      externalId: extractExternalId(fighter1Link.href),
      name: txt(fighter1Link),
    };

    const fighter2: FighterParsed = {
      externalId: extractExternalId(fighter2Link.href),
      name: txt(fighter2Link),
    };

    // Extract weight class (column 6)
    const weightClassCell = cells[6];
    const weightClass = parseWeightClass(txt(weightClassCell));

    // Extract winner
    let winner: WinnerString | null = null;
    if (txt(cells[0]).toLowerCase().includes("win")) winner = "fighter1";
    else if (txt(cells[0]).toLowerCase().includes("draw")) winner = "draw";
    else if (txt(cells[0]).toLowerCase().includes("nc")) winner = "no-contest";

    // Extract method, round, time
    // const methodCell = cells[7];
    // const roundCell = cells[8];
    // const timeCell = cells[9];

    // const method = txt(methodCell);
    // const round = roundCell ? num(txt(roundCell)) : 0;
    // const time = parseTime(txt(timeCell));

    // const result: FightResult = { winner, method, round, time };

    // const isTitleFight = !!$$(cells[6], "img[src$='belt.png']").length;
    // const fightOfTheNightBonus = !!$$(cells[6], "img[src$='fight.png']").length;
    // const performanceBonus = !!$$(cells[6], "img[src$='perf.png']").length;
    // const submissionBonus = !!$$(cells[6], "img[src$='sub.png']").length;
    // const knockoutBonus = !!$$(cells[6], "img[src$='ko.png']").length;

    return {
      externalId: fightExternalId,
      fighter1,
      fighter2,
      weightClass,
      winner,
      // result,
      // isTitleFight,
      // fightOfTheNightBonus,
      // performanceBonus,
      // submissionBonus,
      // knockoutBonus,
    };
  });

  return results.filter((result) => result !== null);
}

/**
 * Parse ufcstats .../event-details/<eventId> page
 */
export function parseUfcstatsEventDetailsPage(document: Document): EventParseResult {
  // Extract event name
  const titleEl = $(document, "h2.b-content__title");
  const name = txt(titleEl);

  // Extract event date and location
  const detailsEl = $(document, ".b-list__info-box");
  const detailItems = $$(detailsEl, ".b-list__box-list-item");

  let eventDate: DateParsed | null = null;
  let location: LocationParsed | null = null;

  detailItems.forEach((item) => {
    const titleEl = $(item, ".b-list__box-item-title");
    const title = txt(titleEl).toLowerCase().replace(":", "");
    const value = txt(item).replace(txt(titleEl), "").trim();

    if (title === "date") {
      eventDate = parseEventDateStructured(value);
    } else if (title === "location") {
      location = parseLocation(value);
    } else {
      throw new Error(`Unexpected event detail: ${title}`);
    }
  });

  if (!eventDate) throw new Error("Event date not found");

  // Extract fights
  const fights = extractFights(document);

  return {
    name,
    eventDate,
    location,
    fights,
  };
}
