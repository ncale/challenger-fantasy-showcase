import type { createQueue, JobData, JobName } from "@challenger-fantasy/ingest-queue";
import { type Browser, chromium } from "playwright";

let _browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (_browser?.isConnected()) return _browser;
  console.log("browser.launching");
  _browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--disable-features=AsyncDns"],
  });
  console.log("browser.launched");
  return _browser;
}

export async function fetchWithPlaywright(url: string): Promise<string> {
  console.log({ url }, "fetch.start");
  const browser = await getBrowser();
  const page = await browser.newPage();
  console.log({ url }, "fetch.page-created");
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    console.log({ url }, "fetch.navigation-done");
    const html = await page.content();
    console.log({ url, bytes: html.length }, "fetch.done");
    return html;
  } finally {
    await page.close();
  }
}

// TODO: just remove this and replace with `await queue.add(...)` in the callers
type IngestQueue = ReturnType<typeof createQueue>;
export async function enqueue(queue: IngestQueue, name: JobName, data: JobData): Promise<void> {
  console.log({ job: name, data }, "enqueue");
  await queue.add(name, data);
}

export function hoursAgo(date: Date | string): number {
  return (Date.now() - new Date(date).getTime()) / 3_600_000;
}
