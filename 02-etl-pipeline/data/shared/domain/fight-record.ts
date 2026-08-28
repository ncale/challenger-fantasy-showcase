type FighterRecord = {
  wins?: number | null;
  losses?: number | null;
  draws?: number | null;
  noContests?: number | null;
};

/**
 * Returns a formatted record string (e.g. "10-5", "10-5-2", "10-5 (1 NC)"),
 * or null when both wins and losses are absent.
 */
export function formatFighterRecord(record: FighterRecord): string | null {
  const { wins, losses, draws, noContests } = record;
  if (wins == null && losses == null) return null;

  const w = wins ?? 0;
  const l = losses ?? 0;
  const d = draws ?? 0;
  const nc = noContests ?? 0;

  let result = `${w}-${l}`;
  if (d > 0) result += `-${d}`;
  if (nc > 0) result += ` (${nc} NC)`;
  return result;
}
