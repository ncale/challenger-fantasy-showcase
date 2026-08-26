import { describe, expect, it } from "bun:test";
import { formatFighterRecord } from "./fight-record";

describe("formatFighterRecord", () => {
  it("formats a basic record", () => {
    expect(formatFighterRecord({ wins: 10, losses: 5 })).toBe("10-5");
  });

  it("includes draws when non-zero", () => {
    expect(formatFighterRecord({ wins: 10, losses: 5, draws: 2 })).toBe("10-5-2");
  });

  it("omits draws when zero", () => {
    expect(formatFighterRecord({ wins: 10, losses: 5, draws: 0 })).toBe("10-5");
  });

  it("appends NC count when non-zero", () => {
    expect(formatFighterRecord({ wins: 10, losses: 5, noContests: 1 })).toBe("10-5 (1 NC)");
  });

  it("appends plural NC count", () => {
    expect(formatFighterRecord({ wins: 10, losses: 5, noContests: 3 })).toBe("10-5 (3 NC)");
  });

  it("includes draws and NC together", () => {
    expect(formatFighterRecord({ wins: 10, losses: 5, draws: 2, noContests: 1 })).toBe(
      "10-5-2 (1 NC)",
    );
  });

  it("formats an undefeated record", () => {
    expect(formatFighterRecord({ wins: 15, losses: 0 })).toBe("15-0");
  });

  it("formats an all-zero record", () => {
    expect(formatFighterRecord({ wins: 0, losses: 0 })).toBe("0-0");
  });

  it("defaults missing wins to 0", () => {
    expect(formatFighterRecord({ losses: 5 })).toBe("0-5");
  });

  it("defaults missing losses to 0", () => {
    expect(formatFighterRecord({ wins: 10 })).toBe("10-0");
  });

  it("returns null when both wins and losses are absent", () => {
    expect(formatFighterRecord({})).toBeNull();
  });

  it("returns null when both wins and losses are null", () => {
    expect(formatFighterRecord({ wins: null, losses: null })).toBeNull();
  });

  it("omits NC when zero", () => {
    expect(formatFighterRecord({ wins: 10, losses: 5, noContests: 0 })).toBe("10-5");
  });
});
