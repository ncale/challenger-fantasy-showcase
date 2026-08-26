import { describe, expect, test } from "bun:test";
import type { FightStatsByFighterId } from "@challenger-fantasy/models";
import type { PointsConfig } from "@challenger-fantasy/schemas";
import { calcGamePoints, getScoringCategoryLabel } from "./scoring";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeStats(overrides: Partial<FightStatsByFighterId> = {}): FightStatsByFighterId {
  return {
    off: null,
    def: null,
    winner: null,
    method: null,
    resultRound: null,
    resultTime: null,
    ...overrides,
  };
}

function makeOff(
  overrides: Partial<{
    distanceLanded: number;
    clinchLanded: number;
    groundLanded: number;
    headLanded: number;
    bodyLanded: number;
    legLanded: number;
    takedownsLanded: number;
    controlTimeSeconds: number;
    knockdowns: number;
    submissionAttempts: number;
  }> = {},
) {
  const {
    distanceLanded = 0,
    clinchLanded = 0,
    groundLanded = 0,
    headLanded = 0,
    bodyLanded = 0,
    legLanded = 0,
    takedownsLanded = 0,
    controlTimeSeconds = 0,
    knockdowns = 0,
    submissionAttempts = 0,
  } = overrides;

  return {
    strikes: {
      distance: { landed: distanceLanded, attempted: distanceLanded },
      clinch: { landed: clinchLanded, attempted: clinchLanded },
      ground: { landed: groundLanded, attempted: groundLanded },
      head: { landed: headLanded, attempted: headLanded },
      body: { landed: bodyLanded, attempted: bodyLanded },
      leg: { landed: legLanded, attempted: legLanded },
    },
    general: {
      takedowns: { landed: takedownsLanded, attempted: takedownsLanded },
      controlTimeSeconds,
      knockdowns,
      submissionAttempts,
    },
  } as FightStatsByFighterId["off"];
}

const BASE_POINTS: PointsConfig = {
  win: 3,
  sigStrike: 0.1,
  standingStrike: 0.05,
  groundStrike: 0.1,
  headStrike: 0.1,
  bodyStrike: 0.05,
  takedown: 1,
  controlTimeSecond: 0.01,
  knockdown: 2,
  subAttempt: 0.5,
  finish: 2,
  finishRnd1Bonus: 2,
  finishRnd2Bonus: 1,
};

// ─── getScoringCategoryLabel ───────────────────────────────────────────────────

describe("getScoringCategoryLabel", () => {
  test("win", () => expect(getScoringCategoryLabel("win")).toBe("Win"));
  test("finish", () => expect(getScoringCategoryLabel("finish")).toBe("Finish"));
  test("finishRnd1Bonus", () =>
    expect(getScoringCategoryLabel("finishRnd1Bonus")).toBe("Round 1 Finish"));
  test("finishRnd2Bonus", () =>
    expect(getScoringCategoryLabel("finishRnd2Bonus")).toBe("Round 2 Finish"));
  test("sigStrike", () => expect(getScoringCategoryLabel("sigStrike")).toBe("Sig. Strikes"));
  test("standingStrike", () =>
    expect(getScoringCategoryLabel("standingStrike")).toBe("Standing Strikes"));
  test("groundStrike", () =>
    expect(getScoringCategoryLabel("groundStrike")).toBe("Ground Strikes"));
  test("headStrike", () => expect(getScoringCategoryLabel("headStrike")).toBe("Head Strikes"));
  test("bodyStrike", () => expect(getScoringCategoryLabel("bodyStrike")).toBe("Body Strikes"));
  test("takedown", () => expect(getScoringCategoryLabel("takedown")).toBe("Takedowns"));
  test("controlTimeSecond", () =>
    expect(getScoringCategoryLabel("controlTimeSecond")).toBe("Control Time (sec)"));
  test("knockdown", () => expect(getScoringCategoryLabel("knockdown")).toBe("Knockdowns"));
  test("subAttempt", () => expect(getScoringCategoryLabel("subAttempt")).toBe("Sub Attempts"));
});

// ─── calcGamePoints ────────────────────────────────────────────────────────────

describe("calcGamePoints", () => {
  describe("null/missing stats", () => {
    test("all-null stats produces zero total", () => {
      const result = calcGamePoints(BASE_POINTS, makeStats());
      expect(result.total).toBe(0);
    });

    test("null off stats — no strike points", () => {
      const result = calcGamePoints(BASE_POINTS, makeStats({ winner: false }));
      expect(result.sigStrike.count).toBe(0);
      expect(result.groundStrike.count).toBe(0);
    });

    test("missing points config values default to 0", () => {
      const result = calcGamePoints(
        {},
        makeStats({ winner: true, method: "KO/TKO", resultRound: 1 }),
      );
      expect(result.total).toBe(0);
    });
  });

  describe("win bonus", () => {
    test("winner: true adds win points", () => {
      const result = calcGamePoints(BASE_POINTS, makeStats({ winner: true }));
      expect(result.win.occurred).toBe(true);
      expect(result.win.pointsEarned).toBe(3);
    });

    test("winner: false earns no win points", () => {
      const result = calcGamePoints(BASE_POINTS, makeStats({ winner: false }));
      expect(result.win.occurred).toBe(false);
      expect(result.win.pointsEarned).toBe(0);
    });

    test("winner: null earns no win points", () => {
      const result = calcGamePoints(BASE_POINTS, makeStats({ winner: null }));
      expect(result.win.occurred).toBe(false);
      expect(result.win.pointsEarned).toBe(0);
    });
  });

  describe("strikes", () => {
    test("sig strikes sum distance + clinch + ground", () => {
      const stats = makeStats({
        off: makeOff({ distanceLanded: 10, clinchLanded: 5, groundLanded: 3 }),
      });
      const result = calcGamePoints({ sigStrike: 0.1 }, stats);
      expect(result.sigStrike.count).toBe(18);
      expect(result.sigStrike.pointsEarned).toBeCloseTo(1.8);
    });

    test("standing strikes sum distance + clinch only", () => {
      const stats = makeStats({
        off: makeOff({ distanceLanded: 10, clinchLanded: 5, groundLanded: 3 }),
      });
      const result = calcGamePoints({ standingStrike: 0.05 }, stats);
      expect(result.standingStrike.count).toBe(15);
      expect(result.standingStrike.pointsEarned).toBeCloseTo(0.75);
    });

    test("ground strikes are ground-landed only", () => {
      const stats = makeStats({ off: makeOff({ distanceLanded: 10, groundLanded: 4 }) });
      const result = calcGamePoints({ groundStrike: 0.1 }, stats);
      expect(result.groundStrike.count).toBe(4);
      expect(result.groundStrike.pointsEarned).toBeCloseTo(0.4);
    });

    test("body strikes include leg landed", () => {
      const stats = makeStats({ off: makeOff({ bodyLanded: 3, legLanded: 2 }) });
      const result = calcGamePoints({ bodyStrike: 0.05 }, stats);
      expect(result.bodyStrike.count).toBe(5);
      expect(result.bodyStrike.pointsEarned).toBeCloseTo(0.25);
    });

    test("head strikes", () => {
      const stats = makeStats({ off: makeOff({ headLanded: 8 }) });
      const result = calcGamePoints({ headStrike: 0.1 }, stats);
      expect(result.headStrike.count).toBe(8);
      expect(result.headStrike.pointsEarned).toBeCloseTo(0.8);
    });
  });

  describe("grappling", () => {
    test("takedowns", () => {
      const stats = makeStats({ off: makeOff({ takedownsLanded: 3 }) });
      const result = calcGamePoints({ takedown: 1 }, stats);
      expect(result.takedown.count).toBe(3);
      expect(result.takedown.pointsEarned).toBe(3);
    });

    test("control time seconds", () => {
      const stats = makeStats({ off: makeOff({ controlTimeSeconds: 60 }) });
      const result = calcGamePoints({ controlTimeSecond: 0.01 }, stats);
      expect(result.controlTimeSecond.count).toBe(60);
      expect(result.controlTimeSecond.pointsEarned).toBeCloseTo(0.6);
    });

    test("submission attempts", () => {
      const stats = makeStats({ off: makeOff({ submissionAttempts: 2 }) });
      const result = calcGamePoints({ subAttempt: 0.5 }, stats);
      expect(result.subAttempt.count).toBe(2);
      expect(result.subAttempt.pointsEarned).toBe(1);
    });

    test("knockdowns", () => {
      const stats = makeStats({ off: makeOff({ knockdowns: 1 }) });
      const result = calcGamePoints({ knockdown: 2 }, stats);
      expect(result.knockdown.count).toBe(1);
      expect(result.knockdown.pointsEarned).toBe(2);
    });
  });

  describe("finish bonus", () => {
    test("KO/TKO winner gets finish points", () => {
      const stats = makeStats({ winner: true, method: "KO/TKO", resultRound: 3 });
      const result = calcGamePoints({ finish: 2 }, stats);
      expect(result.finish.occurred).toBe(true);
      expect(result.finish.pointsEarned).toBe(2);
    });

    test("Submission winner gets finish points", () => {
      const stats = makeStats({ winner: true, method: "Submission", resultRound: 2 });
      const result = calcGamePoints({ finish: 2 }, stats);
      expect(result.finish.occurred).toBe(true);
      expect(result.finish.pointsEarned).toBe(2);
    });

    test("decision winner gets no finish points", () => {
      const stats = makeStats({ winner: true, method: "Decision - Unanimous", resultRound: 3 });
      const result = calcGamePoints({ finish: 2 }, stats);
      expect(result.finish.occurred).toBe(false);
      expect(result.finish.pointsEarned).toBe(0);
    });

    test("KO/TKO loser gets no finish points", () => {
      const stats = makeStats({ winner: false, method: "KO/TKO", resultRound: 1 });
      const result = calcGamePoints({ finish: 2 }, stats);
      expect(result.finish.occurred).toBe(false);
      expect(result.finish.pointsEarned).toBe(0);
    });

    test("TKO - Doctor's Stoppage counts as finish", () => {
      const stats = makeStats({ winner: true, method: "TKO - Doctor's Stoppage", resultRound: 2 });
      const result = calcGamePoints({ finish: 2 }, stats);
      expect(result.finish.occurred).toBe(true);
    });

    test("round 1 finish bonus", () => {
      const stats = makeStats({ winner: true, method: "KO/TKO", resultRound: 1 });
      const result = calcGamePoints({ finish: 2, finishRnd1Bonus: 2 }, stats);
      expect(result.finishRnd1Bonus.occurred).toBe(true);
      expect(result.finishRnd1Bonus.pointsEarned).toBe(2);
      expect(result.finishRnd2Bonus.occurred).toBe(false);
    });

    test("round 2 finish bonus", () => {
      const stats = makeStats({ winner: true, method: "Submission", resultRound: 2 });
      const result = calcGamePoints({ finish: 2, finishRnd1Bonus: 2, finishRnd2Bonus: 1 }, stats);
      expect(result.finishRnd2Bonus.occurred).toBe(true);
      expect(result.finishRnd2Bonus.pointsEarned).toBe(1);
      expect(result.finishRnd1Bonus.occurred).toBe(false);
    });

    test("round 3 finish earns neither bonus", () => {
      const stats = makeStats({ winner: true, method: "KO/TKO", resultRound: 3 });
      const result = calcGamePoints({ finishRnd1Bonus: 2, finishRnd2Bonus: 1 }, stats);
      expect(result.finishRnd1Bonus.occurred).toBe(false);
      expect(result.finishRnd2Bonus.occurred).toBe(false);
    });
  });

  describe("total", () => {
    test("total is sum of all pointsEarned entries", () => {
      const stats = makeStats({
        winner: true,
        method: "KO/TKO",
        resultRound: 1,
        off: makeOff({ distanceLanded: 10, takedownsLanded: 2, knockdowns: 1 }),
      });
      const result = calcGamePoints(BASE_POINTS, stats);
      const expectedTotal = Object.entries(result)
        .filter(([k]) => k !== "total")
        .reduce((sum, [, v]) => sum + (v as { pointsEarned: number }).pointsEarned, 0);
      expect(result.total).toBeCloseTo(expectedTotal);
    });

    test("realistic winner breakdown", () => {
      const stats = makeStats({
        winner: true,
        method: "Submission",
        resultRound: 2,
        off: makeOff({
          distanceLanded: 20,
          clinchLanded: 5,
          groundLanded: 8,
          headLanded: 15,
          bodyLanded: 10,
          legLanded: 3,
          takedownsLanded: 3,
          controlTimeSeconds: 90,
          submissionAttempts: 2,
        }),
      });
      const result = calcGamePoints(BASE_POINTS, stats);
      expect(result.win.pointsEarned).toBe(3);
      expect(result.finish.pointsEarned).toBe(2);
      expect(result.finishRnd2Bonus.pointsEarned).toBe(1);
      expect(result.finishRnd1Bonus.pointsEarned).toBe(0);
      expect(result.takedown.pointsEarned).toBe(3);
      expect(result.total).toBeGreaterThan(0);
    });
  });
});
