import {
  $,
  $$,
  defined,
  num,
  parsePercentage,
  parseStrikeStat,
  parseTakedownPercentage,
  parseTime,
  txt,
} from "../../common.ts";
import type {
  CompletedFightStats,
  FighterGeneralStats,
  FighterStrikesBreakdown,
  GeneralStats,
  GeneralStatsByRound,
  StrikesBreakdown,
  StrikesBreakdownByRound,
} from "./types.ts";

function parseFightStatsRow(row: Element): GeneralStats {
  if (!row) {
    throw new Error("Row is null");
  }

  const cells = $$(row, "td");

  // Skip first cell (fighter names), extract stats from remaining cells
  const kdCells = $$(cells[1], "p");
  const sigStrCells = $$(cells[2], "p");
  const sigStrPctCells = $$(cells[3], "p");
  const totalStrCells = $$(cells[4], "p");
  const tdCells = $$(cells[5], "p");
  const tdPctCells = $$(cells[6], "p");
  const subCells = $$(cells[7], "p");
  const revCells = $$(cells[8], "p");
  const ctrlCells = $$(cells[9], "p");

  const fighter1: FighterGeneralStats = {
    knockdowns: num(txt(kdCells[0])),
    significantStrikes: parseStrikeStat(txt(sigStrCells[0])),
    significantStrikePercentage: parsePercentage(txt(sigStrPctCells[0])),
    totalStrikes: parseStrikeStat(txt(totalStrCells[0])),
    takedowns: parseStrikeStat(txt(tdCells[0])),
    takedownPercentage: parseTakedownPercentage(txt(tdPctCells[0])),
    submissionAttempts: num(txt(subCells[0])),
    reversals: num(txt(revCells[0])),
    controlTime: parseTime(txt(ctrlCells[0])),
  };

  const fighter2: FighterGeneralStats = {
    knockdowns: num(txt(kdCells[1])),
    significantStrikes: parseStrikeStat(txt(sigStrCells[1])),
    significantStrikePercentage: parsePercentage(txt(sigStrPctCells[1])),
    totalStrikes: parseStrikeStat(txt(totalStrCells[1])),
    takedowns: parseStrikeStat(txt(tdCells[1])),
    takedownPercentage: parseTakedownPercentage(txt(tdPctCells[1])),
    submissionAttempts: num(txt(subCells[1])),
    reversals: num(txt(revCells[1])),
    controlTime: parseTime(txt(ctrlCells[1])),
  };

  return { fighter1, fighter2 };
}

function parseSignificantStrikesRow(row: Element | null): StrikesBreakdown {
  if (!row) throw new Error("Row is null");

  const cells = $$(row, "td");

  const sigStrCells = $$(cells[1], "p");
  const sigStrPctCells = $$(cells[2], "p");
  const headCells = $$(cells[3], "p");
  const bodyCells = $$(cells[4], "p");
  const legCells = $$(cells[5], "p");
  const distanceCells = $$(cells[6], "p");
  const clinchCells = $$(cells[7], "p");
  const groundCells = $$(cells[8], "p");

  const fighter1: FighterStrikesBreakdown = {
    total: parseStrikeStat(txt(sigStrCells[0])),
    percentage: parsePercentage(txt(sigStrPctCells[0])),
    head: parseStrikeStat(txt(headCells[0])),
    body: parseStrikeStat(txt(bodyCells[0])),
    leg: parseStrikeStat(txt(legCells[0])),
    distance: parseStrikeStat(txt(distanceCells[0])),
    clinch: parseStrikeStat(txt(clinchCells[0])),
    ground: parseStrikeStat(txt(groundCells[0])),
  };

  const fighter2: FighterStrikesBreakdown = {
    total: parseStrikeStat(txt(sigStrCells[1])),
    percentage: parsePercentage(txt(sigStrPctCells[1])),
    head: parseStrikeStat(txt(headCells[1])),
    body: parseStrikeStat(txt(bodyCells[1])),
    leg: parseStrikeStat(txt(legCells[1])),
    distance: parseStrikeStat(txt(distanceCells[1])),
    clinch: parseStrikeStat(txt(clinchCells[1])),
    ground: parseStrikeStat(txt(groundCells[1])),
  };

  return { fighter1, fighter2 };
}

function parseSigStrikesPerRoundRow(row: Element | null): StrikesBreakdown {
  if (!row) throw new Error("Row is null in parseSigStrikesPerRoundRow");

  const cells = $$(row, "td");

  // Skip first cell (fighter names), extract stats from remaining cells
  const totalCells = $$(cells[1], "p");
  const totalPctCells = $$(cells[2], "p");
  const headCells = $$(cells[3], "p");
  const bodyCells = $$(cells[4], "p");
  const legCells = $$(cells[5], "p");
  const distanceCells = $$(cells[6], "p");
  const clinchCells = $$(cells[7], "p");
  const groundCells = $$(cells[8], "p");

  const fighter1 = {
    total: parseStrikeStat(txt(totalCells[0])),
    percentage: parsePercentage(txt(totalPctCells[0])),
    head: parseStrikeStat(txt(headCells[0])),
    body: parseStrikeStat(txt(bodyCells[0])),
    leg: parseStrikeStat(txt(legCells[0])),
    distance: parseStrikeStat(txt(distanceCells[0])),
    clinch: parseStrikeStat(txt(clinchCells[0])),
    ground: parseStrikeStat(txt(groundCells[0])),
  };

  const fighter2 = {
    total: parseStrikeStat(txt(totalCells[1])),
    percentage: parsePercentage(txt(totalPctCells[1])),
    head: parseStrikeStat(txt(headCells[1])),
    body: parseStrikeStat(txt(bodyCells[1])),
    leg: parseStrikeStat(txt(legCells[1])),
    distance: parseStrikeStat(txt(distanceCells[1])),
    clinch: parseStrikeStat(txt(clinchCells[1])),
    ground: parseStrikeStat(txt(groundCells[1])),
  };

  return { fighter1, fighter2 };
}

export function parseStats(document: Document): CompletedFightStats {
  // Extract general stats
  const totalStatsTable = $$(document, "section.b-fight-details__section table")[0];
  const totalStatsRow = totalStatsTable ? $(totalStatsTable, "tbody tr") : null;

  if (!totalStatsRow) throw new Error("Total stats row not found");
  const generalStats = parseFightStatsRow(totalStatsRow);

  // Extract general stats by round
  const roundStatsTables = $$(document, "table.js-fight-table");
  const roundStatsTable = roundStatsTables[0];
  const generalStatsByRound: GeneralStatsByRound[] = [];

  // Look for round headers - they can be in different structures
  // The round headers are th elements with colspan that contain "Round X" text
  // They're inside thead elements with class b-fight-details__table-row_type_head
  const roundHeaders = $$(
    roundStatsTable,
    "thead.b-fight-details__table-row_type_head th[colspan]",
  );

  roundHeaders.forEach((roundHeader) => {
    const roundText = txt(roundHeader);
    const roundMatch = roundText.match(/Round (\d+)/);
    if (roundMatch) {
      const roundNumber = parseInt(defined(roundMatch[1]), 10);

      // Find the next tbody element that contains the stats for this round
      // We need to find the thead that contains this th, then get its next sibling
      const theadElement = roundHeader.closest("thead");
      let nextElement = theadElement?.nextElementSibling;

      // Skip empty tbody elements
      while (nextElement && nextElement.tagName === "TBODY" && !nextElement.querySelector("tr")) {
        nextElement = nextElement.nextElementSibling;
      }

      if (nextElement && nextElement.tagName === "TBODY") {
        const statsRow = $(nextElement, "tr");
        if (statsRow) {
          const roundStatsData = parseFightStatsRow(statsRow);
          generalStatsByRound.push({
            round: roundNumber,
            fighter1: roundStatsData.fighter1,
            fighter2: roundStatsData.fighter2,
          });
        }
      } else if (nextElement && nextElement.tagName === "TR") {
        // Sometimes the round header is followed directly by a tr element
        const roundStatsData = parseFightStatsRow(nextElement);
        generalStatsByRound.push({
          round: roundNumber,
          fighter1: roundStatsData.fighter1,
          fighter2: roundStatsData.fighter2,
        });
      }
    }
  });

  // Extract strikes breakdown
  const allTables = $$(document, "table");
  const sigStrikesTable = allTables.find((table) => {
    const headers = $$(table, "th");
    return headers.some(
      (h) => txt(h).includes("Head") || txt(h).includes("Body") || txt(h).includes("Leg"),
    );
  });
  const sigStrikesRow = sigStrikesTable ? $(sigStrikesTable, "tbody tr") : null;
  const strikesBreakdown = parseSignificantStrikesRow(sigStrikesRow);

  // Extract strikes breakdown by round
  const strikesBreakdownByRound: StrikesBreakdownByRound[] = [];

  // Look for the detailed significant strikes per round table (usually the second table with js-fight-table class)
  const detailedTables = $$(document, "table.js-fight-table");
  const detailedSigStrikesTable = detailedTables.find((table) => {
    // Check if this table has the detailed breakdown columns (Head, Body, Leg, Distance, Clinch, Ground)
    const headers = $$(table, "th");
    return (
      headers.some((h) => txt(h).includes("Head")) &&
      headers.some((h) => txt(h).includes("Body")) &&
      headers.some((h) => txt(h).includes("Leg")) &&
      headers.some((h) => txt(h).includes("Distance")) &&
      headers.some((h) => txt(h).includes("Clinch")) &&
      headers.some((h) => txt(h).includes("Ground"))
    );
  });

  if (detailedSigStrikesTable) {
    const detailedRoundHeaders = $$(
      detailedSigStrikesTable,
      "thead.b-fight-details__table-row_type_head th[colspan]",
    );

    detailedRoundHeaders.forEach((roundHeader) => {
      const roundText = txt(roundHeader);
      const roundMatch = roundText.match(/Round (\d+)/);
      if (roundMatch) {
        const roundNumber = parseInt(defined(roundMatch[1]), 10);

        // Find the next tbody element that contains the stats for this round
        const theadElement = roundHeader.closest("thead");
        let nextElement = theadElement?.nextElementSibling;

        // Skip empty tbody elements
        while (nextElement && nextElement.tagName === "TBODY" && !nextElement.querySelector("tr")) {
          nextElement = nextElement.nextElementSibling;
        }

        if (nextElement && nextElement.tagName === "TBODY") {
          const statsRow = $(nextElement, "tr");
          if (statsRow) {
            const roundData = parseSigStrikesPerRoundRow(statsRow);
            strikesBreakdownByRound.push({
              round: roundNumber,
              ...roundData,
            });
          }
        } else if (nextElement && nextElement.tagName === "TR") {
          // Sometimes the round header is followed directly by a tr element
          const roundData = parseSigStrikesPerRoundRow(nextElement);
          strikesBreakdownByRound.push({
            round: roundNumber,
            ...roundData,
          });
        }
      }
    });
  }

  return {
    generalStats,
    generalStatsByRound,
    strikesBreakdown,
    strikesBreakdownByRound,
  };
}
