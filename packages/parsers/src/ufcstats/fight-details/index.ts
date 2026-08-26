import { FightResultMethodSchema } from "@challenger-fantasy/schemas";
import {
  $,
  $$,
  type BonusInfo,
  cleanMethod,
  extractExternalId,
  type FightResult,
  num,
  parseTime,
  parseTitleInfo,
  parseWeightClass,
  txt,
  type WinnerString,
} from "../../common.ts";
import { parseStats } from "./helpers.ts";
import type {
  CompletedFightInfo,
  CompletedFightStats,
  FighterParsed,
  FightParseResult,
} from "./types.ts";

function parseCompletedFightResults(document: Document): CompletedFightInfo {
  // Extract fighters
  const fighterElements = $$(document, ".b-fight-details__person");
  const fighter1Element = fighterElements[0];
  const fighter2Element = fighterElements[1];

  // Extract weight class
  const weightClassEl = $(document, ".b-fight-details__fight-title");

  // Extract bonus info
  const bonusInfo: BonusInfo = {
    fightOfTheNightBonus: !!$$(weightClassEl, "img[src$='fight.png']").length,
    performanceBonus: !!$$(weightClassEl, "img[src$='perf.png']").length,
    submissionBonus: !!$$(weightClassEl, "img[src$='sub.png']").length,
    knockoutBonus: !!$$(weightClassEl, "img[src$='ko.png']").length,
  };

  // Text items for fight results
  const textItems = $$(document, ".b-fight-details__text-item");

  // Extract fight result
  const fighter1Status = txt($(fighter1Element, ".b-fight-details__person-status"));
  const fighter2Status = txt($(fighter2Element, ".b-fight-details__person-status"));

  const winner = ((): WinnerString | null => {
    if (fighter1Status === "NC" && fighter2Status === "NC") return "no-contest";
    if (fighter1Status === "D" && fighter2Status === "D") return "draw";
    if (fighter1Status === "W" && fighter2Status === "L") return "fighter1";
    if (fighter2Status === "W" && fighter1Status === "L") return "fighter2";
    if (fighter1Status === "" && fighter2Status === "") return null;
    throw new Error(`Invalid winner: ${fighter1Status} ${fighter2Status}`);
  })();

  const methodEl = $(document, ".b-fight-details__text-item_first i[style*='font-style: normal']");
  const method = FightResultMethodSchema.parse(cleanMethod(txt(methodEl)));

  const round = textItems[0] ? num(txt(textItems[0]).replace("Round:", "").trim()) : 0;
  const time = textItems[1] ? txt(textItems[1]).replace("Time:", "").trim() : "";

  if (winner === null) throw new Error("Winner could not be determined");
  const result: FightResult = {
    winner,
    method,
    round,
    time: parseTime(time),
  };

  // Extract time format
  const timeFormat = textItems[2] ? txt(textItems[2]).replace("Time format:", "").trim() : "";

  // Extract referee
  const refereeEl = textItems[3];
  const referee = refereeEl ? txt($(refereeEl, "span")) : "";

  // Extract details
  let details: string = "";
  const detailsElements = $$(document, ".b-fight-details__text");
  for (const detailsEl of detailsElements) {
    const detailsLabel = $(detailsEl, ".b-fight-details__label");
    if (detailsLabel && txt(detailsLabel).includes("Details:")) {
      // Get the text content after the "Details:" label
      const detailsText = txt(detailsEl).replace("Details:", "").trim().replace(/\s+/g, " "); // Clean up extra whitespace

      // Only capture details for non-decision fights
      // For decisions, the details section typically contains judge info which we handle separately
      if (detailsText && detailsText.length > 0) {
        details = detailsText;
      }
      break;
    }
  }

  return {
    bonusInfo,
    result,
    timeFormat,
    referee,
    details,
  };
}

/**
 * Parse ufcstats .../fight-details/<fightId> page
 */
export function parseUfcstatsFightDetailsPage(document: Document): FightParseResult {
  // Extract event information
  const eventLink = $(document, "h2.b-content__title a.b-link") as HTMLAnchorElement;
  const eventName = txt(eventLink);
  const eventExternalId = extractExternalId(eventLink?.href);

  // Extract fighters
  const fighterElements = $$(document, ".b-fight-details__person");
  const fighter1Element = fighterElements[0];
  const fighter2Element = fighterElements[1];

  const fighter1Link = $(fighter1Element, ".b-fight-details__person-link") as HTMLAnchorElement;
  const fighter2Link = $(fighter2Element, ".b-fight-details__person-link") as HTMLAnchorElement;

  const fighter1: FighterParsed = {
    externalId: extractExternalId(fighter1Link?.href),
    name: txt(fighter1Link),
  };

  const fighter2: FighterParsed = {
    externalId: extractExternalId(fighter2Link?.href),
    name: txt(fighter2Link),
  };

  // Extract weight class
  const weightClassEl = $(document, ".b-fight-details__fight-title");
  const weightClassRaw = txt(weightClassEl);
  const weightClass = parseWeightClass(weightClassRaw);

  // Extract title
  const title = parseTitleInfo(weightClassRaw);

  let completedFightInfo: CompletedFightInfo | null = null;
  try {
    completedFightInfo = parseCompletedFightResults(document);
  } catch {
    // noop - not a completed fight
  }

  let stats: CompletedFightStats | null = null;
  try {
    stats = parseStats(document);
  } catch {
    // noop - not a completed fight
  }

  return {
    eventExternalId,
    eventName,
    fighter1,
    fighter2,
    weightClass,
    title,
    ...completedFightInfo,
    ...stats,
  };
}
