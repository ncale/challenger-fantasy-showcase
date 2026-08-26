import { TIME_MS } from "@challenger-fantasy/shared";
import type { FightWinner } from "@challenger-fantasy/types";
import { ensureDate } from "@challenger-fantasy/utils";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { z } from "zod";

// COMMON

/** @deprecated use the challenger fantasy /utils version instead */
export const isNullish = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

/** @deprecated use the challenger fantasy /utils version instead */
export const isNotNullish = <T>(value: T | null | undefined): value is T => {
  return !isNullish(value);
};

/** @deprecated use the challenger fantasy /utils version instead */
export const isZeroLengthString = (value: string): boolean => {
  return isNotNullish(value) && value.trim().length === 0;
};

/** @deprecated use the challenger fantasy /utils version instead */
export const isUuid = (value: string): boolean => {
  return z.uuid().safeParse(value).success;
};

// UTILS

/** @deprecated */
export const nowPlusMillis = (ms: number): Date => {
  return new Date(Date.now() + ms);
};

export const hash = (str: string): string => {
  return bytesToHex(sha256(utf8ToBytes(str)));
};

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function randJitter(msMin = 300, msMax = 1200) {
  return Math.floor(Math.random() * (msMax - msMin + 1)) + msMin;
}

export function timeExecution(fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}

export const base64Encode = (obj: unknown): string => {
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  return Buffer.from(str).toString("base64");
};

export const base64Decode = (str: string): string => {
  return Buffer.from(str, "base64").toString("utf-8");
};

// DATE & TIME UTILS

export function formattedTimeUntil(date: Date): string {
  const now = new Date();
  let diff = Math.max(0, date.getTime() - now.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) {
    return `${days}d`;
  }
  diff -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) {
    return `${hours}h`;
  }
  diff -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}m`;
}

// toLocaleDateString must be wrapped in a ClientOnly component if used in frontend
export function formatDate(
  dateOrString: Date | string,
  kind: "full" | "only-time" | "only-date" | "game-time" = "full",
): string {
  const date: Date = typeof dateOrString === "string" ? new Date(dateOrString) : dateOrString;
  switch (kind) {
    case "full":
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short",
      });
    case "only-time":
      return date
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          // timeZoneName: "shortGeneric",
        })
        .toLocaleLowerCase();
    case "only-date":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "game-time":
      return (
        `${date.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}, ` +
        date.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZoneName: "shortGeneric",
        })
      );
    default:
      return date.toString();
  }
}

export const getAge = (dob: string | Date, decimals: number = 1): string => {
  const today = new Date();
  const diffTime = today.getTime() - ensureDate(dob).getTime();
  const age = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return age.toFixed(decimals);
};

// SLUGIFY

/** @deprecated use the challenger fantasy /utils version instead */
export const kebab = (s: string) =>
  s
    .normalize("NFKD") // strip accents deterministically
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// BUSINESS LOGIC

export function getRoundsScheduled(timeFormat: string): number {
  switch (timeFormat) {
    case "5 Rnd (5-5-5-5-5)":
      return 5;
    case "3 Rnd (5-5-5)":
      return 3;
    default:
      return -1; // TODO: this is an error code placeholder. FIX THIS
    // throw new InvariantError(`Unknown UFC time format: ${timeFormat}`);
  }
}

export function shortenName(name: string | null | undefined): string {
  if (isNullish(name)) return "";

  const parts = name.trim().split(" ");
  if (parts.length === 1) return name;

  const firstName = parts[0];
  const restOfName = parts.slice(1).join(" ");

  if (!firstName || isNullish(firstName[0]) || !restOfName)
    throw new Error(`Invalid name: ${name}`);

  return `${firstName[0]}. ${restOfName}`;
}

export function getFightWinnerName(
  winner: FightWinner,
  fighter1Name: string,
  fighter2Name: string,
): string {
  if (winner === "f1") return fighter1Name;
  if (winner === "f2") return fighter2Name;
  if (winner === "draw") return "Draw";
  if (winner === "no-contest") return "No Contest";
  throw new Error(`Invalid winner fighter ID: ${winner}`);
}

export function formatEventLocation(
  venue: string | null,
  city: string | null,
  country: string | null,
): string | null {
  const parts = [venue, city, country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function getTimeUntilEvent(eventDate: string): number {
  const now = new Date();
  const event = new Date(eventDate);
  const diffTime = event.getTime() - now.getTime();
  return diffTime;
}

function getDaysUntilEvent(eventDate: string): number {
  const diffTime = getTimeUntilEvent(eventDate);
  const diffDays = Math.ceil(diffTime / TIME_MS.ONE_DAY);
  return diffDays;
}

export function displayDaysUntilEvent(eventDate: string): string {
  const daysUntilEvent = getDaysUntilEvent(eventDate);
  if (daysUntilEvent === 0) return "Today";
  if (daysUntilEvent === 1) return "Tomorrow";
  if (daysUntilEvent >= 14) {
    const weeks = Math.ceil(daysUntilEvent / 7);
    return `${weeks} weeks away`;
  }
  return `${daysUntilEvent} days away`;
}

function formatResultMethod(resultMethod: string | null): string {
  if (!resultMethod) return "";
  if (resultMethod === "Decision - Unanimous") return "Unanimous Decision";
  if (resultMethod === "Decision - Split") return "Split Decision";

  return resultMethod;
}

function formatResultRound(resultRound: number | null): string {
  if (!resultRound) return "";
  return `R${resultRound}`;
}

export function formatResult(resultMethod: string | null, resultRound: number | null): string {
  const round = formatResultRound(resultRound);
  const method = formatResultMethod(resultMethod);
  return `${round}${round && method ? " " : ""}${method}`;
}

export function applyClassIfZero(
  value: string | number,
  className: string = "text-muted-foreground",
) {
  if (value === "-" || value === "0" || value === 0) return className;
  return "";
}

function getOrdinalSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
  }
  return "th";
}

export function formatOrdinal(n: number): string {
  return `${n}${getOrdinalSuffix(n)}`;
}

export function unCamelize(str: string): string {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, (str) => {
    return str.toUpperCase();
  });
}

export function joinStrings(strings: (string | null | undefined)[], separator: string): string {
  return strings.filter((s): s is string => !!s).join(separator);
}

/**
 * Derives HTTP and WebSocket URLs from a base API URL.
 * Respects whether the original URL uses https or http.
 */
export function getApiUrls(apiUrl: string): { http: string; ws: string } {
  const ws = apiUrl.startsWith("https://")
    ? apiUrl.replace("https://", "wss://")
    : apiUrl.replace("http://", "ws://");
  return { http: apiUrl, ws };
}

// TODO: all string formatting utils should go in a @challenger-fantasy/ui package or something similar
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function formatCountdown(seconds: number): string {
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  }
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}
