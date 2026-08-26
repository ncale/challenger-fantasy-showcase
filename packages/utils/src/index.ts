// ─── Number Parsing ───────────────────────────────────────────────────────────

export const num = (str: string): number => {
  const n = parseInt(str.trim(), 10);
  return Number.isNaN(n) ? 0 : n;
};

export const numFloat = (str: string): number => {
  const cleaned = str.trim().replace(/[^\d.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
};

// ─── Type Guards ─────────────────────────────────────────────────────────────

export function isNullish(val: unknown): val is null | undefined {
  return val === null || val === undefined;
}

export const isNotNullish = <T>(value: T | null | undefined): value is T => {
  return !isNullish(value);
};

export function isString(val: unknown): val is string {
  return typeof val === "string";
}

export function isNonEmptyString(val: unknown): val is string {
  return typeof val === "string" && val.length > 0;
}

// ─── Coercions ────────────────────────────────────────────────────────────────

export function ensureDate(val: unknown): Date {
  if (val instanceof Date) return val;
  if (typeof val === "string" || typeof val === "number") {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) throw new TypeError(`Cannot coerce to Date: ${val}`);
    return d;
  }
  throw new TypeError(`Cannot coerce to Date: ${String(val)}`);
}

export function ensureString(val: unknown): string {
  if (typeof val === "string") return val;
  if (val === null || val === undefined)
    throw new TypeError("Cannot coerce nullish value to string");
  return String(val);
}

export function ensureNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    if (Number.isNaN(n)) throw new TypeError(`Cannot coerce to number: ${val}`);
    return n;
  }
  throw new TypeError(`Cannot coerce to number: ${String(val)}`);
}

// ─── Object Utils ─────────────────────────────────────────────────────────────

export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const k = key(item);
    if (!result[k]) result[k] = [];
    result[k].push(item);
  }
  return result;
}

// ─── String Utils ─────────────────────────────────────────────────────────────

export function slugify(str: string): string {
  return str
    .normalize("NFKD")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const slugifyEvent = (eventName: string) => {
  return slugify(eventName);
};

export const slugifyFight = (fighter1Name: string, fighter2Name: string, fullEventId: string) => {
  return `${slugify(fighter1Name)}-vs-${slugify(fighter2Name)}-${fullEventId.slice(0, 8)}`;
};

export const slugifyFighter = (dob: string | Date | undefined, name: string) => {
  if (isNotNullish(dob)) {
    return `${slugify(name)}-${ensureDate(dob).toISOString().split("T")[0]}`;
  }
  return slugify(name);
};

export function truncate(str: string, max: number): string {
  return str.length <= max ? str : `${str.slice(0, max)}…`;
}

// ─── Array Utils ──────────────────────────────────────────────────────────────

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

export function compact<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item !== null && item !== undefined);
}

// ─── Date Utils ───────────────────────────────────────────────────────────────

/**
 * Minimal date formatter. Supports tokens: YYYY, MM, DD, HH, mm, ss.
 * For anything more complex, use a dedicated date library.
 */
export function formatDate(date: Date, format: string): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return format
    .replace("YYYY", String(date.getFullYear()))
    .replace("MM", pad(date.getMonth() + 1))
    .replace("DD", pad(date.getDate()))
    .replace("HH", pad(date.getHours()))
    .replace("mm", pad(date.getMinutes()))
    .replace("ss", pad(date.getSeconds()));
}
