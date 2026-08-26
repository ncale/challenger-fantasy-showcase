import { describe, expect, test } from "bun:test";
import { getWeightCodeFromKey, getWeightLbsFromKey, toWeightClassKey } from "./weight-class";

// ─── toWeightClassKey ─────────────────────────────────────────────────────────

describe("toWeightClassKey", () => {
  describe("men's divisions", () => {
    test("flyweight", () => expect(toWeightClassKey("flyweight")).toBe("125lbs_flyweight"));
    test("bantamweight", () =>
      expect(toWeightClassKey("bantamweight")).toBe("135lbs_bantamweight"));
    test("featherweight", () =>
      expect(toWeightClassKey("featherweight")).toBe("145lbs_featherweight"));
    test("lightweight", () => expect(toWeightClassKey("lightweight")).toBe("155lbs_lightweight"));
    test("welterweight", () =>
      expect(toWeightClassKey("welterweight")).toBe("170lbs_welterweight"));
    test("middleweight", () =>
      expect(toWeightClassKey("middleweight")).toBe("185lbs_middleweight"));
    test("light heavyweight", () =>
      expect(toWeightClassKey("light heavyweight")).toBe("205lbs_light_heavyweight"));
    test("heavyweight", () => expect(toWeightClassKey("heavyweight")).toBe("265lbs_heavyweight"));
  });

  describe("women's divisions", () => {
    test("women's strawweight", () =>
      expect(toWeightClassKey("women's strawweight")).toBe("115lbs_women_strawweight"));
    test("women's flyweight", () =>
      expect(toWeightClassKey("women's flyweight")).toBe("125lbs_women_flyweight"));
    test("women's bantamweight", () =>
      expect(toWeightClassKey("women's bantamweight")).toBe("135lbs_women_bantamweight"));
    test("women's featherweight", () =>
      expect(toWeightClassKey("women's featherweight")).toBe("145lbs_women_featherweight"));
  });

  test("catch weight", () => expect(toWeightClassKey("catch weight")).toBe("catchweight"));

  describe("normalization", () => {
    test("trims whitespace", () =>
      expect(toWeightClassKey("  lightweight  ")).toBe("155lbs_lightweight"));
    test("uppercased input", () =>
      expect(toWeightClassKey("Lightweight")).toBe("155lbs_lightweight"));
    test("all caps", () => expect(toWeightClassKey("HEAVYWEIGHT")).toBe("265lbs_heavyweight"));
  });

  test("unknown string throws", () =>
    expect(() => toWeightClassKey("super heavyweight")).toThrow("Unknown weight class"));
});

// ─── getWeightCodeFromKey ─────────────────────────────────────────────────────

describe("getWeightCodeFromKey", () => {
  test("flyweight → FLW", () => expect(getWeightCodeFromKey("125lbs_flyweight")).toBe("FLW"));
  test("bantamweight → BW", () => expect(getWeightCodeFromKey("135lbs_bantamweight")).toBe("BW"));
  test("featherweight → FW", () => expect(getWeightCodeFromKey("145lbs_featherweight")).toBe("FW"));
  test("lightweight → LW", () => expect(getWeightCodeFromKey("155lbs_lightweight")).toBe("LW"));
  test("welterweight → WW", () => expect(getWeightCodeFromKey("170lbs_welterweight")).toBe("WW"));
  test("middleweight → MW", () => expect(getWeightCodeFromKey("185lbs_middleweight")).toBe("MW"));
  test("light heavyweight → LHW", () =>
    expect(getWeightCodeFromKey("205lbs_light_heavyweight")).toBe("LHW"));
  test("heavyweight → HW", () => expect(getWeightCodeFromKey("265lbs_heavyweight")).toBe("HW"));
  test("catchweight → CW", () => expect(getWeightCodeFromKey("catchweight")).toBe("CW"));
  test("women's strawweight → WSW", () =>
    expect(getWeightCodeFromKey("115lbs_women_strawweight")).toBe("WSW"));
  test("women's flyweight → WFLW", () =>
    expect(getWeightCodeFromKey("125lbs_women_flyweight")).toBe("WFLW"));
  test("women's bantamweight → WBW", () =>
    expect(getWeightCodeFromKey("135lbs_women_bantamweight")).toBe("WBW"));
  test("women's featherweight → WFW", () =>
    expect(getWeightCodeFromKey("145lbs_women_featherweight")).toBe("WFW"));
  test("n/a → N/A", () => expect(getWeightCodeFromKey("n/a")).toBe("N/A"));
  test("unknown key throws", () =>
    expect(() => getWeightCodeFromKey("super heavyweight")).toThrow("Unknown weight class key"));
});

// ─── getWeightLbsFromKey ──────────────────────────────────────────────────────

describe("getWeightLbsFromKey", () => {
  test("flyweight → 125", () => expect(getWeightLbsFromKey("125lbs_flyweight")).toBe(125));
  test("bantamweight → 135", () => expect(getWeightLbsFromKey("135lbs_bantamweight")).toBe(135));
  test("featherweight → 145", () => expect(getWeightLbsFromKey("145lbs_featherweight")).toBe(145));
  test("lightweight → 155", () => expect(getWeightLbsFromKey("155lbs_lightweight")).toBe(155));
  test("welterweight → 170", () => expect(getWeightLbsFromKey("170lbs_welterweight")).toBe(170));
  test("middleweight → 185", () => expect(getWeightLbsFromKey("185lbs_middleweight")).toBe(185));
  test("light heavyweight → 205", () =>
    expect(getWeightLbsFromKey("205lbs_light_heavyweight")).toBe(205));
  test("heavyweight → 265", () => expect(getWeightLbsFromKey("265lbs_heavyweight")).toBe(265));
  test("catchweight → 0", () => expect(getWeightLbsFromKey("catchweight")).toBe(0));
  test("women's strawweight → 115", () =>
    expect(getWeightLbsFromKey("115lbs_women_strawweight")).toBe(115));
  test("women's flyweight → 125", () =>
    expect(getWeightLbsFromKey("125lbs_women_flyweight")).toBe(125));
  test("women's bantamweight → 135", () =>
    expect(getWeightLbsFromKey("135lbs_women_bantamweight")).toBe(135));
  test("women's featherweight → 145", () =>
    expect(getWeightLbsFromKey("145lbs_women_featherweight")).toBe(145));
  test("unknown key throws", () =>
    expect(() => getWeightLbsFromKey("super heavyweight")).toThrow("Unknown weight class key"));
});
