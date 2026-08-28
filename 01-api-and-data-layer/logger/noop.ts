import type { AppLogger } from "./types";

/**
 * A no-op logger that satisfies AppLogger but does nothing.
 * Use as a default in shared packages so they work in tests
 * or any context where logging isn't needed.
 *
 * @example
 * class DraftService {
 *   constructor(private logger: AppLogger = noopLogger) {}
 * }
 */
export const noopLogger: AppLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};
