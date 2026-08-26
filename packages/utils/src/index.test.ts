import { describe, expect, test } from "bun:test";
import {
  chunk,
  compact,
  ensureDate,
  ensureNumber,
  ensureString,
  formatDate,
  groupBy,
  isNonEmptyString,
  isNullish,
  isString,
  slugify,
  truncate,
  unique,
} from "./index";

// ─── isNullish ────────────────────────────────────────────────────────────────

describe("isNullish", () => {
  test("null", () => expect(isNullish(null)).toBe(true));
  test("undefined", () => expect(isNullish(undefined)).toBe(true));
  test("0", () => expect(isNullish(0)).toBe(false));
  test("empty string", () => expect(isNullish("")).toBe(false));
  test("false", () => expect(isNullish(false)).toBe(false));
  test("object", () => expect(isNullish({})).toBe(false));
});

// ─── isString ─────────────────────────────────────────────────────────────────

describe("isString", () => {
  test("string", () => expect(isString("hello")).toBe(true));
  test("empty string", () => expect(isString("")).toBe(true));
  test("number", () => expect(isString(1)).toBe(false));
  test("null", () => expect(isString(null)).toBe(false));
  test("undefined", () => expect(isString(undefined)).toBe(false));
});

// ─── isNonEmptyString ─────────────────────────────────────────────────────────

describe("isNonEmptyString", () => {
  test("non-empty string", () => expect(isNonEmptyString("hello")).toBe(true));
  test("empty string", () => expect(isNonEmptyString("")).toBe(false));
  test("number", () => expect(isNonEmptyString(42)).toBe(false));
  test("null", () => expect(isNonEmptyString(null)).toBe(false));
});

// ─── ensureDate ───────────────────────────────────────────────────────────────

describe("ensureDate", () => {
  test("Date passthrough", () => {
    const d = new Date("2024-01-01");
    expect(ensureDate(d)).toBe(d);
  });
  test("ISO string", () => {
    expect(ensureDate("2024-06-15")).toEqual(new Date("2024-06-15"));
  });
  test("numeric timestamp", () => {
    const ts = Date.now();
    expect(ensureDate(ts)).toEqual(new Date(ts));
  });
  test("invalid string throws", () => {
    expect(() => ensureDate("not-a-date")).toThrow(TypeError);
  });
  test("object throws", () => {
    expect(() => ensureDate({})).toThrow(TypeError);
  });
  test("null throws", () => {
    expect(() => ensureDate(null)).toThrow(TypeError);
  });
});

// ─── ensureString ─────────────────────────────────────────────────────────────

describe("ensureString", () => {
  test("string passthrough", () => expect(ensureString("hello")).toBe("hello"));
  test("empty string passthrough", () => expect(ensureString("")).toBe(""));
  test("number coerced", () => expect(ensureString(42)).toBe("42"));
  test("boolean coerced", () => expect(ensureString(true)).toBe("true"));
  test("null throws", () => expect(() => ensureString(null)).toThrow(TypeError));
  test("undefined throws", () => expect(() => ensureString(undefined)).toThrow(TypeError));
});

// ─── ensureNumber ─────────────────────────────────────────────────────────────

describe("ensureNumber", () => {
  test("number passthrough", () => expect(ensureNumber(42)).toBe(42));
  test("zero passthrough", () => expect(ensureNumber(0)).toBe(0));
  test("numeric string coerced", () => expect(ensureNumber("3.14")).toBe(3.14));
  test("non-numeric string throws", () => expect(() => ensureNumber("abc")).toThrow(TypeError));
  test("null throws", () => expect(() => ensureNumber(null)).toThrow(TypeError));
  test("object throws", () => expect(() => ensureNumber({})).toThrow(TypeError));
});

// ─── groupBy ──────────────────────────────────────────────────────────────────

describe("groupBy", () => {
  test("groups by key", () => {
    const input = [
      { type: "a", val: 1 },
      { type: "b", val: 2 },
      { type: "a", val: 3 },
    ];
    expect(groupBy(input, (x) => x.type)).toEqual({
      a: [
        { type: "a", val: 1 },
        { type: "a", val: 3 },
      ],
      b: [{ type: "b", val: 2 }],
    });
  });
  test("empty array", () => expect(groupBy([], (x: string) => x)).toEqual({}));
  test("all same key", () => {
    expect(groupBy([1, 2, 3], () => "x")).toEqual({ x: [1, 2, 3] });
  });
});

// ─── slugify ──────────────────────────────────────────────────────────────────

describe("slugify", () => {
  test("lowercases", () => expect(slugify("Hello World")).toBe("hello-world"));
  test("replaces spaces with hyphens", () => expect(slugify("foo bar")).toBe("foo-bar"));
  test("collapses multiple separators", () => expect(slugify("foo  --  bar")).toBe("foo-bar"));
  test("strips leading and trailing hyphens", () => expect(slugify("--foo--")).toBe("foo"));
  test("strips special characters", () =>
    expect(slugify("UFC 300: Main Event!")).toBe("ufc-300-main-event"));
  test("fighter vs fighter", () =>
    expect(slugify("jon jones vs stipe miocic")).toBe("jon-jones-vs-stipe-miocic"));
  test("already a slug", () => expect(slugify("already-a-slug")).toBe("already-a-slug"));
  test("empty string", () => expect(slugify("")).toBe(""));
});

// ─── truncate ─────────────────────────────────────────────────────────────────

describe("truncate", () => {
  test("short string unchanged", () => expect(truncate("hi", 10)).toBe("hi"));
  test("exact length unchanged", () => expect(truncate("hello", 5)).toBe("hello"));
  test("truncates and appends ellipsis", () => expect(truncate("hello world", 5)).toBe("hello…"));
  test("max 0 returns ellipsis", () => expect(truncate("hi", 0)).toBe("…"));
});

// ─── unique ───────────────────────────────────────────────────────────────────

describe("unique", () => {
  test("removes duplicates", () => expect(unique([1, 2, 2, 3])).toEqual([1, 2, 3]));
  test("preserves order", () => expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]));
  test("strings", () => expect(unique(["a", "b", "a"])).toEqual(["a", "b"]));
  test("empty array", () => expect(unique([])).toEqual([]));
  test("no duplicates unchanged", () => expect(unique([1, 2, 3])).toEqual([1, 2, 3]));
});

// ─── chunk ────────────────────────────────────────────────────────────────────

describe("chunk", () => {
  test("even split", () =>
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]));
  test("remainder in last chunk", () =>
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]));
  test("size larger than array", () => expect(chunk([1, 2], 5)).toEqual([[1, 2]]));
  test("size of 1", () => expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]));
  test("empty array", () => expect(chunk([], 3)).toEqual([]));
});

// ─── compact ──────────────────────────────────────────────────────────────────

describe("compact", () => {
  test("removes nulls and undefineds", () =>
    expect(compact([1, null, 2, undefined, 3])).toEqual([1, 2, 3]));
  test("all nullish returns empty", () => expect(compact([null, undefined])).toEqual([]));
  test("no nullish unchanged", () => expect(compact([1, 2, 3])).toEqual([1, 2, 3]));
  test("keeps falsy non-nullish values", () =>
    expect(compact([0, "", false, null])).toEqual([0, "", false]));
  test("empty array", () => expect(compact([])).toEqual([]));
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
  const d = new Date(2024, 5, 7, 9, 4, 3); // June 7 2024, 09:04:03 local

  test("YYYY", () => expect(formatDate(d, "YYYY")).toBe("2024"));
  test("MM zero-pads", () => expect(formatDate(d, "MM")).toBe("06"));
  test("DD zero-pads", () => expect(formatDate(d, "DD")).toBe("07"));
  test("HH zero-pads", () => expect(formatDate(d, "HH")).toBe("09"));
  test("mm zero-pads", () => expect(formatDate(d, "mm")).toBe("04"));
  test("ss zero-pads", () => expect(formatDate(d, "ss")).toBe("03"));
  test("full format", () => expect(formatDate(d, "YYYY-MM-DD")).toBe("2024-06-07"));
  test("datetime format", () =>
    expect(formatDate(d, "YYYY-MM-DD HH:mm:ss")).toBe("2024-06-07 09:04:03"));
});
