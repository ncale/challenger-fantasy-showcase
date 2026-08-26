import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { parseDocumentFromPage } from "../src/common.ts";
import { parseUfcstatsEventDetailsPage } from "../src/ufcstats/event-details/index.ts";
import { parseUfcstatsEventsUpcomingPage } from "../src/ufcstats/events-upcoming/index.ts";
import { parseUfcstatsFightDetailsPage } from "../src/ufcstats/fight-details/index.ts";
import { parseUfcstatsFighterDetailsPage } from "../src/ufcstats/fighter-details/index.ts";

const PARSERS_DIR = new URL("..", import.meta.url).pathname;
const FIXTURES_DIR = join(PARSERS_DIR, "fixtures");
const SNAPSHOTS_DIR = join(PARSERS_DIR, "snapshots");

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

async function generateSnapshots() {
  await mkdir(SNAPSHOTS_DIR, { recursive: true });

  const files = (await readdir(FIXTURES_DIR)).filter((f) => f.endsWith(".html"));

  for (const file of files) {
    const parser = resolveParser(file);
    if (!parser) {
      console.warn(`No parser found for ${file}, skipping`);
      continue;
    }

    const html = await readFile(join(FIXTURES_DIR, file), "utf-8");
    const document = parseDocumentFromPage(html);
    const result = parser(document);
    const snapshotFile = join(SNAPSHOTS_DIR, `${basename(file, ".html")}.json`);
    await writeFile(snapshotFile, JSON.stringify(result, null, 2));
    console.log(`  wrote ${basename(file, ".html")}.json`);
  }

  console.log("done");
}

generateSnapshots().catch((err) => {
  console.error(err);
  process.exit(1);
});
