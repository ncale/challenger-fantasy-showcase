import type {
  BonusInfo,
  DateParsed,
  FighterRecord,
  FightResult,
  FightStatPair,
  HeightParsed,
  LocationParsed,
  ReachParsed,
  StrikeStat,
  TimeParsed,
  TitleInfo,
  WeightClassParsed,
  WeightParsed,
  WinnerString,
} from "../types";
import { num, numFloat } from "../data/utils";
import { parseHTML } from "linkedom";

export type {
  BonusInfo,
  DateParsed,
  FightResult,
  FightStatPair,
  HeightParsed,
  LocationParsed,
  ReachParsed,
  TimeParsed,
  TitleInfo,
  WeightClassParsed,
  WeightParsed,
  WinnerString,
};

export { num, numFloat };

export function defined<T>(val: T | undefined, msg = "Unexpected undefined"): T {
  if (val === undefined) throw new Error(msg);
  return val;
}

// NOTICE: This logic is duplicated in the core package. It should be moved to a shared location.
// TODO: move this logic to a shared location
export const parseDocumentFromPage = (html: string): Document => {
  const { document } = parseHTML(html);
  document.querySelectorAll("script, style, meta").forEach((el) => {
    el.remove();
  });
  document.head?.remove();

  return document;
};

// COMMON PARSING UTILITIES

// DOM query helpers

export const $ = (root: Document | Element | null | undefined, sel: string) =>
  root?.querySelector(sel) ?? null;
export const $$ = (root: Document | Element | null | undefined, sel: string) =>
  root ? Array.from(root.querySelectorAll(sel)) : [];

// Safe text extraction from DOM elements

export const txt = (el: Element | null | undefined) => (el?.textContent ?? "").trim();

// Parse percentage from text (e.g., "50%" -> 50)

export const parsePercentage = (str: string): number => {
  const match = str.match(/(\d+)%/);
  return match ? parseInt(defined(match[1]), 10) : 0;
};

// Parse takedown percentage, handling "---" for no attempts

export const parseTakedownPercentage = (text: string): number | null => {
  if (text.includes("---")) return null;
  return parsePercentage(text);
};

// Parse "X of Y" format commonly used in fight stats

export const parseStrikeStat = (text: string): StrikeStat => {
  const match = text.match(/(\d+)\s+of\s+(\d+)/);
  if (match) {
    return {
      landed: parseInt(defined(match[1]), 10),
      attempted: parseInt(defined(match[2]), 10),
    };
  }
  return { landed: 0, attempted: 0 };
};

// Parse record string (e.g., "6-1-0 (1 NC)" -> {wins: 6, losses: 1, draws: 0, noContests: 1})

export const parseRecord = (recordStr: string): FighterRecord => {
  const match = recordStr.match(/(\d+)-(\d+)-(\d+)(?:\s*\((\d+)\s*NC\))?/);
  if (match) {
    return {
      wins: parseInt(defined(match[1]), 10),
      losses: parseInt(defined(match[2]), 10),
      draws: parseInt(defined(match[3]), 10),
      noContests: match[4] ? parseInt(match[4], 10) : 0,
    };
  }
  return { wins: 0, losses: 0, draws: 0, noContests: 0 };
};

// Parse event date to ISO string, returning null if not parseable

export const parseEventDateToIso = (dateStr: string): string => {
  if (!dateStr || !dateStr.trim()) throw new Error("Invalid date string");
  const date = new Date(dateStr.trim());
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date string");
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
};

// Extract external ID from URL (last segment)

export const extractExternalId = (url?: string): string => {
  return url ? (url.split("/").pop() ?? "") : "";
};

// Common fight stat pair used in fighter history

export const parseStatPair = (text: string): FightStatPair => {
  const numbers = text.match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    return {
      fighter: parseInt(defined(numbers[0]), 10),
      opponent: parseInt(defined(numbers[1]), 10),
    };
  }
  return { fighter: 0, opponent: 0 };
};

// Parse location string into city, state/region, country components

export const parseLocation = (raw: string): LocationParsed => {
  if (!raw || !raw.trim()) {
    return { city: null, stateOrRegion: null, country: null, raw };
  }

  const trimmed = raw.trim();
  const parts = trimmed
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (parts.length === 0) {
    return { city: null, stateOrRegion: null, country: null, raw };
  }

  if (parts.length === 1) {
    return { city: parts[0] || null, stateOrRegion: null, country: null, raw };
  }

  if (parts.length === 2) {
    return { city: parts[0] || null, stateOrRegion: null, country: parts[1] || null, raw };
  }

  return {
    city: parts[0] || null,
    stateOrRegion: parts[1] || null,
    country: parts[2] || null,
    raw,
  };
};

// Parse height string into normalized values

export const parseHeight = (raw: string): HeightParsed => {
  if (!raw || !raw.trim()) {
    return { cm: null, inches: null, raw };
  }

  const trimmed = raw.trim();

  const feetInchesMatch = trimmed.match(/(\d+)['']?\s*(\d+)[""]?/);
  if (feetInchesMatch) {
    const feet = parseInt(defined(feetInchesMatch[1]), 10);
    const inches = parseInt(defined(feetInchesMatch[2]), 10);
    const totalInches = feet * 12 + inches;
    const cm = Math.round(totalInches * 2.54);
    return { cm, inches: totalInches, raw };
  }

  const feetOnlyMatch = trimmed.match(/(\d+)['']?\s*(?:ft|feet)?$/);
  if (feetOnlyMatch) {
    const feet = parseInt(defined(feetOnlyMatch[1]), 10);
    const totalInches = feet * 12;
    const cm = Math.round(totalInches * 2.54);
    return { cm, inches: totalInches, raw };
  }

  const cmMatch = trimmed.match(/(\d+)\s*cm/i);
  if (cmMatch) {
    const cm = parseInt(defined(cmMatch[1]), 10);
    const inches = Math.round(cm / 2.54);
    return { cm, inches, raw };
  }

  return { cm: null, inches: null, raw };
};

// Parse weight string into normalized values

export const parseWeight = (raw: string): WeightParsed => {
  if (!raw || !raw.trim()) {
    return { kg: null, lbs: null, raw };
  }

  const trimmed = raw.trim();

  const lbsMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)/i);
  if (lbsMatch) {
    const lbs = parseFloat(defined(lbsMatch[1]));
    const kg = Math.round(lbs * 0.453592 * 10) / 10;
    return { kg, lbs, raw };
  }

  const kgMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)/i);
  if (kgMatch) {
    const kg = parseFloat(defined(kgMatch[1]));
    const lbs = Math.round(kg * 2.20462 * 10) / 10;
    return { kg, lbs, raw };
  }

  return { kg: null, lbs: null, raw };
};

export const parseReach = (raw: string): ReachParsed => {
  if (!raw || !raw.trim()) {
    return { cm: null, inches: null, raw };
  }

  const trimmed = raw.trim();

  const inchesMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:"|in|inches?)/i);
  if (inchesMatch) {
    const inches = parseFloat(defined(inchesMatch[1]));
    const cm = Math.round(inches * 2.54);
    return { cm, inches, raw };
  }

  const cmMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*cm/i);
  if (cmMatch) {
    const cm = parseFloat(defined(cmMatch[1]));
    const inches = Math.round((cm / 2.54) * 10) / 10;
    return { cm, inches, raw };
  }

  return { cm: null, inches: null, raw };
};

// Parse time string (MM:SS format) into normalized values

export const parseTime = (raw: string): TimeParsed => {
  if (!raw || !raw.trim()) {
    return { seconds: 0, raw };
  }

  const cleanRaw = raw.trim();

  const timeMatch = cleanRaw.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const minutes = parseInt(defined(timeMatch[1]), 10);
    const seconds = parseInt(defined(timeMatch[2]), 10);
    const totalSeconds = minutes * 60 + seconds;
    return { seconds: totalSeconds, raw: cleanRaw };
  }

  return { seconds: 0, raw: cleanRaw };
};

// Clean up method strings by removing excessive whitespace and newlines

export const cleanMethod = (raw: string): string => {
  if (!raw || !raw.trim()) {
    throw new Error("Invalid method string");
  }

  const parts = raw
    .split(/\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    throw new Error("Invalid method string");
  }

  if (parts.length === 1) {
    return defined(parts[0]);
  }

  const mainMethod = defined(parts[0]);
  const details = parts.slice(1).join(" ");

  return details ? `${mainMethod} - ${details}` : mainMethod;
};

// Remove quotes from fighter nicknames

export const cleanNickname = (nickname: string): string => {
  if (!nickname || !nickname.trim()) {
    return "";
  }

  return nickname.trim().replace(/^["']|["']$/g, "");
};

// WEIGHT CLASS

// TODO: this should use the shared package weight class utils
export const parseWeightClass = (raw: string): WeightClassParsed => {
  if (!raw || !raw.trim()) {
    return { weightClass: "", raw };
  }

  const cleanRaw = raw.trim();

  // NOTE: Order matters! More specific patterns (like "Light Heavyweight") must come before less specific ones ("Heavyweight")
  const weightClassPatterns = [
    /\b(Light Heavyweight)\b/i,
    /\b(Heavyweight)\b/i,
    /\b(Women's Strawweight)\b/i,
    /\b(Women's Flyweight)\b/i,
    /\b(Women's Bantamweight)\b/i,
    /\b(Women's Featherweight)\b/i,
    /\b(Middleweight)\b/i,
    /\b(Welterweight)\b/i,
    /\b(Lightweight)\b/i,
    /\b(Featherweight)\b/i,
    /\b(Bantamweight)\b/i,
    /\b(Strawweight)\b/i,
    /\b(Flyweight)\b/i,
    /\b(\w+weight)\b/i,
  ];

  for (const pattern of weightClassPatterns) {
    const match = cleanRaw.match(pattern);
    if (match) {
      return {
        weightClass: defined(match[1]),
        raw: cleanRaw,
      };
    }
  }

  const titleMatch = cleanRaw.match(/UFC\s+(\w+(?:\s+\w+)*)\s+Title/i);
  if (titleMatch) {
    return {
      weightClass: defined(titleMatch[1]),
      raw: cleanRaw,
    };
  }

  const fallbackWeightClass = cleanRaw
    .replace(/\s+Bout$/i, "")
    .replace(/\s+Title$/i, "")
    .trim();

  return {
    weightClass: fallbackWeightClass,
    raw: cleanRaw,
  };
};

// Parse title information from weight class string

export const parseTitleInfo = (weightClassRaw: string): TitleInfo => {
  if (!weightClassRaw || !weightClassRaw.trim()) {
    return { isTitle: false };
  }

  const cleanRaw = weightClassRaw.trim().toLowerCase();
  const isTitleFight = cleanRaw.includes("title") || cleanRaw.includes("championship");

  if (!isTitleFight) {
    return { isTitle: false };
  }

  let titleName = weightClassRaw.trim();
  titleName = titleName.replace(/\s+Bout$/i, "").trim();

  return {
    isTitle: true,
    name: titleName,
  };
};

// EVENT DATE

export const parseEventDateStructured = (raw: string): DateParsed => {
  if (!raw || !raw.trim()) throw new Error("Invalid date string");

  const cleanRaw = raw.trim();
  const isoDate = parseEventDateToIso(cleanRaw);

  return {
    iso: isoDate,
    raw: cleanRaw,
  };
};
