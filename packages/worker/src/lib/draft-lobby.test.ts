import { describe, expect, test } from "bun:test";
import type { Drafter } from "@challenger-fantasy/schemas";
import { DraftLobby } from "./draft-lobby";

const CONFIG = { draftSize: 2, numRounds: 3, pickClockSeconds: 30 };
const FIGHTERS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"];

function makeDrafter(userId: string): Drafter {
  return { sessionId: `session-${userId}`, userId, username: userId, picks: [] };
}

function makeFullLobby() {
  const lobby = new DraftLobby({ kind: "init", draftConfig: CONFIG, allFighterIds: FIGHTERS });
  lobby.syncUsers([makeDrafter("u1"), makeDrafter("u2")]);
  return lobby;
}

function makeInProgressLobby() {
  const lobby = makeFullLobby();
  lobby.startDraft();
  return lobby;
}

// ─── constructor ──────────────────────────────────────────────────────────────

describe("constructor", () => {
  test("init: starts pending with no users", () => {
    const lobby = new DraftLobby({ kind: "init", draftConfig: CONFIG, allFighterIds: FIGHTERS });
    const state = lobby.getState();
    expect(state.status).toBe("pending");
    expect(state.users.size).toBe(0);
    expect(state.draftConfig).toEqual(CONFIG);
  });

  test("resume: restores provided state", () => {
    const drafter = makeDrafter("u1");
    const lobby = new DraftLobby({
      kind: "resume",
      state: {
        status: "pending",
        users: new Set([drafter]),
        draftConfig: CONFIG,
        nextPickAt: undefined,
      },
      allFighterIds: FIGHTERS,
    });
    expect(lobby.getState().users.size).toBe(1);
  });
});

// ─── syncUsers ────────────────────────────────────────────────────────────────

describe("syncUsers", () => {
  test("adds sessions as users", () => {
    const lobby = new DraftLobby({ kind: "init", draftConfig: CONFIG, allFighterIds: FIGHTERS });
    lobby.syncUsers([makeDrafter("u1")]);
    expect(lobby.getState().users.size).toBe(1);
  });

  test("deduplicates by userId", () => {
    const lobby = new DraftLobby({ kind: "init", draftConfig: CONFIG, allFighterIds: FIGHTERS });
    const d = makeDrafter("u1");
    lobby.syncUsers([d, { ...d, sessionId: "other-session" }]);
    expect(lobby.getState().users.size).toBe(1);
  });

  test("caps users at draftSize", () => {
    const lobby = new DraftLobby({ kind: "init", draftConfig: CONFIG, allFighterIds: FIGHTERS });
    lobby.syncUsers([makeDrafter("u1"), makeDrafter("u2"), makeDrafter("u3")]);
    expect(lobby.getState().users.size).toBe(2);
  });

  test("no-op when draft is not pending", () => {
    const lobby = makeFullLobby();
    const stateBefore = lobby.getState();
    lobby.syncUsers([makeDrafter("u3"), makeDrafter("u4")]);
    expect(lobby.getState()).toBe(stateBefore);
  });

  test("transitions to initializing when lobby fills", () => {
    const lobby = makeFullLobby();
    expect(lobby.getState().status).toBe("initializing");
  });

  test("pickOrder contains all user IDs when initializing", () => {
    const lobby = makeFullLobby();
    const state = lobby.getState();
    if (state.status !== "initializing") throw new Error("Expected initializing");
    expect(state.pickOrder).toHaveLength(2);
    expect(state.pickOrder).toContain("u1");
    expect(state.pickOrder).toContain("u2");
  });
});

// ─── startDraft ───────────────────────────────────────────────────────────────

describe("startDraft", () => {
  test("transitions to in-progress", () => {
    const lobby = makeFullLobby();
    lobby.startDraft();
    expect(lobby.getState().status).toBe("in-progress");
  });

  test("sets currentRound to 1", () => {
    const lobby = makeFullLobby();
    lobby.startDraft();
    const state = lobby.getState();
    if (state.status !== "in-progress") throw new Error();
    expect(state.currentRound).toBe(1);
  });

  test("currentPickerId is first in pickOrder", () => {
    const lobby = makeFullLobby();
    lobby.startDraft();
    const state = lobby.getState();
    if (state.status !== "in-progress") throw new Error();

    const currentPicker = state.pickOrder[0];
    expect(currentPicker).toBeString();

    if (currentPicker) {
      expect(state.currentPickerId).toBe(currentPicker);
    }
  });

  test("no-op when not initializing", () => {
    const lobby = new DraftLobby({ kind: "init", draftConfig: CONFIG, allFighterIds: FIGHTERS });
    lobby.startDraft();
    expect(lobby.getState().status).toBe("pending");
  });
});

// ─── handlePick ───────────────────────────────────────────────────────────────

describe("handlePick", () => {
  test("throws when draft is not in-progress", () => {
    const lobby = new DraftLobby({ kind: "init", draftConfig: CONFIG, allFighterIds: FIGHTERS });
    expect(() => lobby.handlePick("u1", { fighterId: "f1", timestamp: Date.now() })).toThrow(
      "Draft not in progress",
    );
  });

  test("returns unchanged state when it is not the user's turn", () => {
    const lobby = makeInProgressLobby();
    const state = lobby.getState();
    if (state.status !== "in-progress") throw new Error();
    const wrongUser = state.pickOrder[1];
    if (!wrongUser) throw new Error();
    lobby.handlePick(wrongUser, { fighterId: "f1", timestamp: Date.now() });
    const after = lobby.getState();
    if (after.status !== "in-progress") throw new Error();
    expect(after.currentPickerId).toBe(state.currentPickerId);
  });

  test("throws for an unavailable fighter", () => {
    const lobby = makeInProgressLobby();
    const state = lobby.getState();
    if (state.status !== "in-progress") throw new Error();
    expect(() =>
      lobby.handlePick(state.currentPickerId, { fighterId: "unknown", timestamp: Date.now() }),
    ).toThrow("Fighter not available");
  });

  test("records pick on the correct user", () => {
    const lobby = makeInProgressLobby();
    const state = lobby.getState();
    if (state.status !== "in-progress") throw new Error();
    const pickerId = state.currentPickerId;
    lobby.handlePick(pickerId, { fighterId: "f1", timestamp: Date.now() });
    const user = Array.from(lobby.getState().users).find((u) => u.userId === pickerId);
    expect(user?.picks).toHaveLength(1);
    expect(user?.picks[0]?.fighterId).toBe("f1");
  });

  test("advances to the next picker after a valid pick", () => {
    const lobby = makeInProgressLobby();
    const state = lobby.getState();
    if (state.status !== "in-progress") throw new Error();
    const firstPicker = state.currentPickerId;
    lobby.handlePick(firstPicker, { fighterId: "f1", timestamp: Date.now() });
    const after = lobby.getState();
    if (after.status !== "in-progress") throw new Error();
    expect(after.currentPickerId).not.toBe(firstPicker);
  });

  test("prevents picking the same fighter twice", () => {
    const lobby = makeInProgressLobby();
    const s1 = lobby.getState();
    if (s1.status !== "in-progress") throw new Error();
    lobby.handlePick(s1.currentPickerId, { fighterId: "f1", timestamp: Date.now() });
    const s2 = lobby.getState();
    if (s2.status !== "in-progress") throw new Error();
    expect(() =>
      lobby.handlePick(s2.currentPickerId, { fighterId: "f1", timestamp: Date.now() }),
    ).toThrow("Fighter not available");
  });
});

// ─── snake draft order ────────────────────────────────────────────────────────

describe("snake draft order", () => {
  test("pick order follows snake pattern across rounds", () => {
    const lobby = makeInProgressLobby();
    const state = lobby.getState();
    if (state.status !== "in-progress") throw new Error();
    const [first, second] = state.pickOrder as [string, string];

    const sequence: string[] = [];
    for (let i = 0; i < 6; i++) {
      const s = lobby.getState();
      if (s.status !== "in-progress") throw new Error();
      sequence.push(s.currentPickerId);
      lobby.handlePick(s.currentPickerId, {
        fighterId: FIGHTERS[i] as string,
        timestamp: Date.now(),
      });
    }

    // Round 1 (forward): first, second
    // Round 2 (backward): second, first
    // Round 3 (forward): first, second
    expect(sequence).toEqual([first, second, second, first, first, second]);
  });
});

// ─── completion ───────────────────────────────────────────────────────────────

describe("completion", () => {
  test("transitions to completed when all slots are filled", () => {
    const lobby = makeInProgressLobby();
    for (let i = 0; i < 6; i++) {
      const s = lobby.getState();
      if (s.status !== "in-progress") throw new Error();
      lobby.handlePick(s.currentPickerId, {
        fighterId: FIGHTERS[i] as string,
        timestamp: Date.now(),
      });
    }
    expect(lobby.getState().status).toBe("completed");
  });
});

// ─── autoPick ─────────────────────────────────────────────────────────────────

describe("autoPick", () => {
  test("returns state unchanged when not in-progress", () => {
    const lobby = new DraftLobby({ kind: "init", draftConfig: CONFIG, allFighterIds: FIGHTERS });
    const state = lobby.getState();
    expect(lobby.autoPick()).toBe(state);
  });

  test("picks a valid available fighter for the current picker", () => {
    const lobby = makeInProgressLobby();
    const before = lobby.getState();
    if (before.status !== "in-progress") throw new Error();
    const pickerId = before.currentPickerId;
    lobby.autoPick();
    const user = Array.from(lobby.getState().users).find((u) => u.userId === pickerId);
    expect(user?.picks).toHaveLength(1);
    expect(FIGHTERS).toContain(user?.picks[0]?.fighterId);
  });

  test("advances turn after auto-picking", () => {
    const lobby = makeInProgressLobby();
    const before = lobby.getState();
    if (before.status !== "in-progress") throw new Error();
    lobby.autoPick();
    const after = lobby.getState();
    if (after.status !== "in-progress") throw new Error();
    expect(after.currentPickerId).not.toBe(before.currentPickerId);
  });

  test("does not pick an already-picked fighter", () => {
    const lobby = makeInProgressLobby();
    const s1 = lobby.getState();
    if (s1.status !== "in-progress") throw new Error();
    lobby.handlePick(s1.currentPickerId, { fighterId: "f1", timestamp: Date.now() });
    lobby.autoPick();
    const pickedFighterIds = Array.from(lobby.getState().users).flatMap((u) =>
      u.picks.map((p) => p.fighterId),
    );
    expect(new Set(pickedFighterIds).size).toBe(pickedFighterIds.length);
  });
});
