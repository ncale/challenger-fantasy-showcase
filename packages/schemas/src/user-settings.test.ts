import { describe, expect, test } from "bun:test";
import { UsernameSchema } from "./user-settings";

// Helper that returns true/false so test cases stay one-liners
const valid = (u: string) => UsernameSchema.safeParse(u).success;

// Helper that returns the first error message for invalid inputs
const errorMsg = (u: string): string => {
  const result = UsernameSchema.safeParse(u);
  if (result.success) return "";
  return result.error.issues[0]?.message ?? "";
};

describe("UsernameSchema", () => {
  // ─── valid usernames ──────────────────────────────────────────────────────

  describe("valid usernames", () => {
    test("simple lowercase word", () => expect(valid("alice")).toBe(true));
    test("simple uppercase word", () => expect(valid("Alice")).toBe(true));
    test("mixed case", () => expect(valid("AliceB")).toBe(true));
    test("digits only (≥ 3 chars)", () => expect(valid("123")).toBe(true));
    test("starts with letter, ends with digit", () => expect(valid("user1")).toBe(true));
    test("contains underscore", () => expect(valid("alice_bob")).toBe(true));
    test("contains hyphen", () => expect(valid("alice-bob")).toBe(true));
    test("contains both underscore and hyphen", () => expect(valid("alice_bob-cf")).toBe(true));
    test("exactly 3 characters", () => expect(valid("abc")).toBe(true));
    test("exactly 20 characters", () => expect(valid("a".repeat(19) + "b")).toBe(true));
    test("all digits at min length", () => expect(valid("007")).toBe(true));
    test("uppercase letters with digits", () => expect(valid("UFC123")).toBe(true));
    test("starts with digit, has letters", () => expect(valid("1fighter")).toBe(true));
    test("reserved word with suffix is allowed", () => expect(valid("admin1")).toBe(true));
    test("reserved word as prefix is allowed", () => expect(valid("system_user")).toBe(true));
  });

  // ─── too short ───────────────────────────────────────────────────────────

  describe("too short", () => {
    test("empty string", () => {
      expect(valid("")).toBe(false);
    });
    test("1 character", () => {
      expect(valid("a")).toBe(false);
      expect(errorMsg("a")).toMatch(/3 characters/);
    });
    test("2 characters", () => {
      expect(valid("ab")).toBe(false);
      expect(errorMsg("ab")).toMatch(/3 characters/);
    });
  });

  // ─── too long ────────────────────────────────────────────────────────────

  describe("too long", () => {
    test("21 characters", () => {
      expect(valid("a".repeat(21))).toBe(false);
      expect(errorMsg("a".repeat(21))).toMatch(/20 characters/);
    });
    test("50 characters", () => {
      expect(valid("a".repeat(50))).toBe(false);
      expect(errorMsg("a".repeat(50))).toMatch(/20 characters/);
    });
  });

  // ─── invalid starting character ──────────────────────────────────────────

  describe("invalid starting character", () => {
    test("starts with underscore", () => {
      expect(valid("_alice")).toBe(false);
      expect(errorMsg("_alice")).toMatch(/must start with a letter or number/);
    });
    test("starts with hyphen", () => {
      expect(valid("-alice")).toBe(false);
      expect(errorMsg("-alice")).toMatch(/must start with a letter or number/);
    });
    test("starts with space", () => {
      expect(valid(" alice")).toBe(false);
    });
    test("starts with special char", () => {
      expect(valid("!alice")).toBe(false);
    });
  });

  // ─── disallowed characters ───────────────────────────────────────────────

  describe("disallowed characters", () => {
    test("contains space", () => {
      expect(valid("alice bob")).toBe(false);
      expect(errorMsg("alice bob")).toMatch(/letters, numbers, underscores, and hyphens/);
    });
    test("contains @", () => expect(valid("alice@bob")).toBe(false));
    test("contains .", () => expect(valid("alice.bob")).toBe(false));
    test("contains !", () => expect(valid("alice!")).toBe(false));
    test("contains emoji", () => expect(valid("alice🥊")).toBe(false));
    test("unicode letter (é)", () => expect(valid("aliçe")).toBe(false));
    test("null byte", () => expect(valid("ali\x00ce")).toBe(false));
  });

  // ─── reserved words ──────────────────────────────────────────────────────

  describe("reserved usernames", () => {
    const reserved = [
      "admin",
      "support",
      "help",
      "null",
      "undefined",
      "moderator",
      "system",
      "bot",
      "official",
    ];

    for (const word of reserved) {
      test(`exact match: "${word}"`, () => {
        expect(valid(word)).toBe(false);
        expect(errorMsg(word)).toMatch(/reserved/);
      });

      test(`uppercase match: "${word.toUpperCase()}"`, () => {
        expect(valid(word.toUpperCase())).toBe(false);
        expect(errorMsg(word.toUpperCase())).toMatch(/reserved/);
      });

      test(`mixed case: "${word[0]?.toUpperCase()}${word.slice(1)}"`, () => {
        const mixed = word[0]?.toUpperCase() + word.slice(1);
        expect(valid(mixed)).toBe(false);
        expect(errorMsg(mixed)).toMatch(/reserved/);
      });
    }
  });

  // ─── boundary / edge cases ───────────────────────────────────────────────

  describe("boundary and edge cases", () => {
    test("all underscores after first char", () => expect(valid("a___")).toBe(true));
    test("all hyphens after first char", () => expect(valid("a---")).toBe(true));
    test("underscore at end", () => expect(valid("alice_")).toBe(true));
    test("hyphen at end", () => expect(valid("alice-")).toBe(true));
    test("digit start, underscore, digit end", () => expect(valid("1_2")).toBe(true));
    test("non-breaking space is rejected", () => expect(valid("alice\u00a0bob")).toBe(false));
    test("tab character is rejected", () => expect(valid("ali\tce")).toBe(false));
  });
});
