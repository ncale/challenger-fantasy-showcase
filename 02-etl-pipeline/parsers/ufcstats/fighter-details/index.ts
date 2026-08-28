import {
  $,
  $$,
  defined,
  extractExternalId,
  numFloat,
  parseEventDateStructured,
  parseHeight,
  parseReach,
  parseRecord,
  parseStatPair,
  parseWeight,
  txt,
} from "../../common.ts";
import type {
  CareerStats,
  FighterParseResult,
  FightHistoryEntry,
  FightResultType,
  GrapplingStats,
  PerformanceBonus,
  PhysicalStats,
  StrikingStats,
} from "./types.ts";

/**
 * Validate that the document is a UFC fighter page
 */
function validateFighterPage(document: Document): void {
  const titleEl = $(document, "h2.b-content__title");
  const nameEl = $(titleEl, ".b-content__title-highlight, span");

  if (!titleEl || !nameEl) {
    throw new Error("Expected UFC fighter page with title and fighter name");
  }
}

/**
 * Parse a UFC fighter details page to extract fighter profile and fight history.
 *
 * The page contains:
 * - Fighter name, nickname, and record
 * - Physical statistics (height, weight, reach, stance, DOB)
 * - Career statistics (striking and grappling averages)
 * - Complete fight history with opponents, results, and statistics
 *
 * This parser extracts all available fighter data including detailed fight history.
 */
export function parseUfcstatsFighterDetailsPage(document: Document): FighterParseResult {
  validateFighterPage(document);

  // Extract fighter name and record
  const titleEl = $(document, "h2.b-content__title");
  const nameEl = $(titleEl, ".b-content__title-highlight");
  const recordEl = $(titleEl, ".b-content__title-record");

  const name = txt(nameEl);
  const recordStr = txt(recordEl);
  const record = parseRecord(recordStr);

  // Extract nickname
  const nicknameEl = $(document, ".b-content__Nickname");
  const nickname = txt(nicknameEl) || undefined;

  // Extract physical stats
  const physicalStatsItems = $$(
    document,
    ".b-list__info-box_style_small-width .b-list__box-list-item",
  );
  const physicalStats: PhysicalStats = {
    height: null,
    weight: null,
    reach: null,
    stance: null,
    dateOfBirth: null,
  };

  physicalStatsItems.forEach((item) => {
    const titleEl = $(item, ".b-list__box-item-title");
    const title = txt(titleEl).toLowerCase().replace(":", "");
    const value = txt(item).replace(txt(titleEl), "").trim();

    switch (title) {
      case "height":
        physicalStats.height = value ? parseHeight(value) : null;
        break;
      case "weight":
        physicalStats.weight = value ? parseWeight(value) : null;
        break;
      case "reach":
        physicalStats.reach = value ? parseReach(value) : null;
        break;
      case "stance":
        physicalStats.stance = value || null;
        break;
      case "dob":
        physicalStats.dateOfBirth = value ? parseEventDateStructured(value) : null;
        break;
    }
  });

  // Extract career statistics
  const careerStatsItems = $$(
    document,
    ".b-list__info-box_style_middle-width .b-list__box-list-item",
  );
  const strikingStats: StrikingStats = {
    significantStrikesLandedPerMinute: 0,
    strikingAccuracy: 0,
    significantStrikesAbsorbedPerMinute: 0,
    strikingDefense: 0,
  };
  const grapplingStats: GrapplingStats = {
    takedownAverage: 0,
    takedownAccuracy: 0,
    takedownDefense: 0,
    submissionAverage: 0,
  };

  careerStatsItems.forEach((item) => {
    const titleEl = $(item, ".b-list__box-item-title");
    const title = txt(titleEl).toLowerCase().replace(":", "");
    const value = txt(item).replace(txt(titleEl), "").trim();

    switch (title) {
      case "slpm":
        strikingStats.significantStrikesLandedPerMinute = numFloat(value);
        break;
      case "str. acc.":
        strikingStats.strikingAccuracy = numFloat(value);
        break;
      case "sapm":
        strikingStats.significantStrikesAbsorbedPerMinute = numFloat(value);
        break;
      case "str. def":
        strikingStats.strikingDefense = numFloat(value);
        break;
      case "td avg.":
        grapplingStats.takedownAverage = numFloat(value);
        break;
      case "td acc.":
        grapplingStats.takedownAccuracy = numFloat(value);
        break;
      case "td def.":
        grapplingStats.takedownDefense = numFloat(value);
        break;
      case "sub. avg.":
        grapplingStats.submissionAverage = numFloat(value);
        break;
    }
  });

  const careerStats: CareerStats = {
    strikingStats,
    grapplingStats,
  };

  // Extract fight history
  const fightRows = $$(
    document,
    "table.b-fight-details__table tbody tr.b-fight-details__table-row",
  );
  const fightHistory: FightHistoryEntry[] = [];

  fightRows.forEach((row) => {
    // Skip empty rows or first row if it's a spacer
    const resultEl = $(row, ".b-flag");
    if (!resultEl) return;

    // Extract result
    const resultText = txt(resultEl).toLowerCase();
    let result: FightResultType = "upcoming";

    if (resultText.includes("win")) result = "win";
    else if (resultText.includes("loss")) result = "loss";
    else if (resultText.includes("draw")) result = "draw";
    else if (resultText.includes("nc")) result = "no-contest";
    else if (resultText.includes("next")) result = "upcoming";

    // Extract opponent information
    const fighterCells = $$(row, "td:nth-child(2) a.b-link");
    let opponentName = "";
    let opponentExternalId = "";

    // Find the opponent (not the current fighter)
    fighterCells.forEach((link) => {
      const fighterName = txt(link);
      const href = (link as HTMLAnchorElement).href;
      const fighterId = extractExternalId(href);

      // Assume the first link is current fighter, second is opponent
      // This could be improved by comparing with the known fighter name
      if (fighterName !== name) {
        opponentName = fighterName;
        opponentExternalId = fighterId;
      }
    });

    // If we couldn't determine opponent from name comparison, use the second link
    if (!opponentName && fighterCells.length >= 2) {
      const opponentLink = fighterCells[1] as HTMLAnchorElement;
      opponentName = txt(opponentLink);
      opponentExternalId = extractExternalId(opponentLink?.href);
    }

    // Extract fight ID - different methods for upcoming vs completed fights
    let fightExternalId = "";

    // Method 1: Try onclick attribute (for completed fights)
    const onclickAttr = row.getAttribute("onclick") || "";
    const dataLink = row.getAttribute("data-link") || "";
    const fightUrlFromOnclick = onclickAttr.match(/doNav\('([^']+)'\)/)?.[1] || dataLink;

    if (fightUrlFromOnclick) {
      fightExternalId = extractExternalId(fightUrlFromOnclick);
    } else {
      // Method 2: Try anchor tags with fight-details href (for upcoming fights)
      const fightLinks = $$(row, "a[href*='fight-details']");
      if (fightLinks.length > 0) {
        const fightLink = fightLinks[0] as HTMLAnchorElement;
        fightExternalId = extractExternalId(fightLink.href);
      }
    }

    // Extract event information
    // For upcoming fights, the structure is different due to colspan
    const allCells = $$(row, "td");
    let eventCell: Element | null = null;

    // Look for a cell with an event link (contains href with "event-details")
    for (const cell of allCells) {
      const link = $(cell, "a[href*='event-details']");
      if (link) {
        eventCell = cell;
        break;
      }
    }

    const eventLink = eventCell ? ($(eventCell, "a.b-link") as HTMLAnchorElement) : null;
    const eventName = eventLink ? txt(eventLink) : "";
    const eventExternalId = extractExternalId(eventLink?.href);

    const eventDateElements = eventCell ? $$(eventCell, "p") : [];
    const eventDateEl = eventDateElements[1] || eventDateElements[0]; // Try second p, fallback to first
    const eventDateStr = eventDateEl ? txt(eventDateEl) : "";
    const eventDate = eventDateStr ? parseEventDateStructured(eventDateStr).iso : null;

    // Create the appropriate fight history entry based on result type
    if (result === "upcoming") {
      // For upcoming fights, only include base properties
      fightHistory.push({
        fightExternalId,
        opponentExternalId,
        opponentName,
        result: "upcoming",
        eventExternalId,
        eventName,
        eventDate,
      });
    } else {
      // For completed fights, extract additional data
      const methodEl = $(row, "td:nth-child(8)");
      const roundEl = $(row, "td:nth-child(9)");
      const timeEl = $(row, "td:nth-child(10)");

      const methodText = txt(methodEl);
      // Clean up method text by taking only the first line/main method
      const method = methodText ? defined(methodText.split("\n")[0]).trim() : "";
      const roundText = txt(roundEl);
      const round = roundText ? parseInt(roundText, 10) : 1;
      const time = txt(timeEl) || "";

      // Extract stats
      const kdEl = $(row, "td:nth-child(3)");
      const strEl = $(row, "td:nth-child(4)");
      const tdEl = $(row, "td:nth-child(5)");
      const subEl = $(row, "td:nth-child(6)");

      const kdText = txt(kdEl);
      const strText = txt(strEl);
      const tdText = txt(tdEl);
      const subText = txt(subEl);

      const knockdowns =
        kdText && kdText !== "--" ? parseStatPair(kdText) : { fighter: 0, opponent: 0 };
      const strikes =
        strText && strText !== "--" ? parseStatPair(strText) : { fighter: 0, opponent: 0 };
      const takedowns =
        tdText && tdText !== "--" ? parseStatPair(tdText) : { fighter: 0, opponent: 0 };
      const submissionAttempts =
        subText && subText !== "--" ? parseStatPair(subText) : { fighter: 0, opponent: 0 };

      // Extract performance bonuses
      const bonusImages = $$(
        row,
        "img.b-statistics__table-status, img[src*='perf.png'], img[src*='fight.png'], img[src*='sub.png'], img[src*='ko.png']",
      );
      const bonuses: PerformanceBonus[] = [];

      bonusImages.forEach((img) => {
        const src = (img as HTMLImageElement).src;
        if (src.includes("fight.png")) bonuses.push("fight");
        else if (src.includes("perf.png")) bonuses.push("performance");
        else if (src.includes("sub.png")) bonuses.push("submission");
        else if (src.includes("ko.png")) bonuses.push("knockout");
      });

      fightHistory.push({
        fightExternalId,
        opponentExternalId,
        opponentName,
        result: result as Exclude<FightResultType, "upcoming">,
        eventExternalId,
        eventName,
        eventDate,
        method,
        round,
        time,
        knockdowns,
        strikes,
        takedowns,
        submissionAttempts,
        bonuses: bonuses.length > 0 ? bonuses : undefined,
      });
    }
  });

  return {
    name,
    nickname,
    record,
    physicalStats,
    careerStats,
    fightHistory,
  };
}
