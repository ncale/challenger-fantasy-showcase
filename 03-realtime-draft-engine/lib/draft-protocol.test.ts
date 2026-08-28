import { describe, expect, test } from "bun:test";
import { DraftProtocol } from "./draft-protocol";

function makeRequest(headers?: Record<string, string>) {
  return new Request("https://example.com", { headers });
}

// ─── pack ─────────────────────────────────────────────────────────────────────

describe("pack", () => {
  test("encodes string fields as base64 headers", () => {
    const packed = DraftProtocol.pack(makeRequest(), { gameId: "game-123" });
    const val = packed.headers.get("x-encoded-game-id");
    expect(val).not.toBeNull();
    expect(val).not.toBe("game-123"); // must be encoded, not raw
  });

  test("encodes boolean isDemo as string before encoding", () => {
    const packedTrue = DraftProtocol.pack(makeRequest(), { isDemo: true });
    const packedFalse = DraftProtocol.pack(makeRequest(), { isDemo: false });
    expect(packedTrue.headers.get("x-encoded-is-demo")).not.toBeNull();
    expect(packedFalse.headers.get("x-encoded-is-demo")).not.toBeNull();
    expect(packedTrue.headers.get("x-encoded-is-demo")).not.toBe(
      packedFalse.headers.get("x-encoded-is-demo"),
    );
  });

  test("omits headers for undefined fields", () => {
    const packed = DraftProtocol.pack(makeRequest(), { gameId: "g1" });
    expect(packed.headers.get("x-encoded-user-id")).toBeNull();
    expect(packed.headers.get("x-encoded-username")).toBeNull();
    expect(packed.headers.get("x-encoded-draft-group-id")).toBeNull();
  });

  test("preserves existing headers", () => {
    const packed = DraftProtocol.pack(makeRequest({ "x-custom": "keep-me" }), { gameId: "g1" });
    expect(packed.headers.get("x-custom")).toBe("keep-me");
  });

  test("does not mutate the original request", () => {
    const original = makeRequest();
    DraftProtocol.pack(original, { gameId: "g1" });
    expect(original.headers.get("x-encoded-game-id")).toBeNull();
  });
});

// ─── unpack ───────────────────────────────────────────────────────────────────

describe("unpack", () => {
  test("returns undefined for all missing fields", () => {
    const result = DraftProtocol.unpack(makeRequest());
    expect(result.gameId).toBeUndefined();
    expect(result.userId).toBeUndefined();
    expect(result.username).toBeUndefined();
    expect(result.draftGroupId).toBeUndefined();
    expect(result.draftStatus).toBeUndefined();
  });

  test("isDemo defaults to false when header is absent", () => {
    expect(DraftProtocol.unpack(makeRequest()).isDemo).toBe(false);
  });

  test("accepts a Headers object directly", () => {
    const packed = DraftProtocol.pack(makeRequest(), { userId: "u1" });
    expect(DraftProtocol.unpack(packed.headers).userId).toBe("u1");
  });
});

// ─── round-trip ───────────────────────────────────────────────────────────────

describe("pack → unpack round-trip", () => {
  test("all string fields survive", () => {
    const packed = DraftProtocol.pack(makeRequest(), {
      gameId: "game-123",
      userId: "user-456",
      username: "alice",
      draftGroupId: "group-789",
    });
    const result = DraftProtocol.unpack(packed);
    expect(result.gameId).toBe("game-123");
    expect(result.userId).toBe("user-456");
    expect(result.username).toBe("alice");
    expect(result.draftGroupId).toBe("group-789");
  });

  test("isDemo: true round-trips as true", () => {
    const packed = DraftProtocol.pack(makeRequest(), { isDemo: true });
    expect(DraftProtocol.unpack(packed).isDemo).toBe(true);
  });

  test("isDemo: false round-trips as false", () => {
    const packed = DraftProtocol.pack(makeRequest(), { isDemo: false });
    expect(DraftProtocol.unpack(packed).isDemo).toBe(false);
  });

  test("draftStatus round-trips", () => {
    for (const status of ["pending", "initializing", "in-progress", "completed"] as const) {
      const packed = DraftProtocol.pack(makeRequest(), { draftStatus: status });
      expect(DraftProtocol.unpack(packed).draftStatus).toBe(status);
    }
  });

  test("packing multiple times does not corrupt headers", () => {
    const first = DraftProtocol.pack(makeRequest(), { gameId: "g1" });
    const second = DraftProtocol.pack(first, { userId: "u1" });
    const result = DraftProtocol.unpack(second);
    expect(result.gameId).toBe("g1");
    expect(result.userId).toBe("u1");
  });
});

// ─── parseResponseStatus ──────────────────────────────────────────────────────

describe("parseResponseStatus", () => {
  test("returns null when header is absent", () => {
    expect(DraftProtocol.parseResponseStatus(new Response())).toBeNull();
  });

  test("decodes status from header", () => {
    // Use pack to produce the encoded header value, then inject into a response
    const packed = DraftProtocol.pack(makeRequest(), { draftStatus: "in-progress" });
    // biome-ignore lint/style/noNonNullAssertion: <permit non-null since the test will fail if an error is thrown>
    const encoded = packed.headers.get("x-encoded-draft-status")!;
    const res = new Response(null, { headers: { "x-encoded-draft-status": encoded } });
    expect(DraftProtocol.parseResponseStatus(res)).toBe("in-progress");
  });

  test("round-trips all statuses", () => {
    for (const status of ["pending", "initializing", "in-progress", "completed"] as const) {
      const packed = DraftProtocol.pack(makeRequest(), { draftStatus: status });
      // biome-ignore lint/style/noNonNullAssertion: <permit non-null since the test will fail if an error is thrown>
      const encoded = packed.headers.get("x-encoded-draft-status")!;
      const res = new Response(null, { headers: { "x-encoded-draft-status": encoded } });
      expect(DraftProtocol.parseResponseStatus(res)).toBe(status);
    }
  });
});
