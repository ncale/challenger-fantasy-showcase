import { describe, expect, it } from "bun:test";
import { parseFullEventName } from "./parse-full-event-name";

describe("parseFullEventName", () => {
  it("parses a numbered event", () => {
    const result = parseFullEventName("UFC 300: Jones vs. Smith");
    expect(result.seriesName).toBe("UFC 300");
    expect(result.headlineName).toBe("Jones vs. Smith");
  });

  it("parses a fight night event", () => {
    const result = parseFullEventName("UFC Fight Night: Jones vs. Smith");
    expect(result.seriesName).toBe("UFC Fight Night");
    expect(result.headlineName).toBe("Jones vs. Smith");
  });

  it("handles no colon", () => {
    const result = parseFullEventName("UFC 300");
    expect(result.seriesName).toBe("UFC 300");
    expect(result.headlineName).toBe("");
  });

  it("handles extra whitespace", () => {
    const result = parseFullEventName("  UFC 300  :  Jones vs. Smith  ");
    expect(result.seriesName).toBe("UFC 300");
    expect(result.headlineName).toBe("Jones vs. Smith");
  });

  it("handles a colon in the headlineName", () => {
    const result = parseFullEventName("UFC 300: Jones vs. Smith: Rematch");
    expect(result.seriesName).toBe("UFC 300");
    expect(result.headlineName).toBe("Jones vs. Smith: Rematch");
  });

  it("handles an empty string", () => {
    const result = parseFullEventName("");
    expect(result.seriesName).toBe("");
    expect(result.headlineName).toBe("");
  });
});
