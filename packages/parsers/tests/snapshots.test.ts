import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parseDocumentFromPage } from "../src/common.ts";
import { parseUfcstatsEventDetailsPage } from "../src/ufcstats/event-details/index.ts";
import { parseUfcstatsEventsUpcomingPage } from "../src/ufcstats/events-upcoming/index.ts";
import { parseUfcstatsFightDetailsPage } from "../src/ufcstats/fight-details/index.ts";
import { parseUfcstatsFighterDetailsPage } from "../src/ufcstats/fighter-details/index.ts";

const FIXTURES_DIR = join(__dirname, "../fixtures");
const SNAPSHOTS_DIR = join(__dirname, "../snapshots");

type ParserFn = (doc: Document) => unknown;

const parsersByPrefix: Record<string, ParserFn> = {
  "event-details": parseUfcstatsEventDetailsPage,
  "events-upcoming": parseUfcstatsEventsUpcomingPage,
  "fight-details": parseUfcstatsFightDetailsPage,
  "fighter-details": parseUfcstatsFighterDetailsPage,
};

function resolveParser(filename: string): ParserFn | null {
  for (const [prefix, parser] of Object.entries(parsersByPrefix)) {
    if (filename.startsWith(prefix)) return parser;
  }
  return null;
}

const fixtureFiles = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".html"));

describe("parser snapshots", () => {
  for (const file of fixtureFiles) {
    const parser = resolveParser(file);
    if (!parser) continue;

    const name = basename(file, ".html");

    test(name, () => {
      const html = readFileSync(join(FIXTURES_DIR, file), "utf-8");
      const document = parseDocumentFromPage(html);
      const result = JSON.parse(JSON.stringify(parser(document)));

      const snapshot = JSON.parse(readFileSync(join(SNAPSHOTS_DIR, `${name}.json`), "utf-8"));

      expect(result).toEqual(snapshot);
    });
  }
});
