export function mapWinner(winner: string): "f1" | "f2" | "draw" | "no-contest" {
  switch (winner) {
    case "fighter1":
      return "f1";
    case "fighter2":
      return "f2";
    case "draw":
      return "draw";
    case "no-contest":
      return "no-contest";
    default:
      throw new Error(`Unknown winner value: ${winner}`);
  }
}

export function secondsToRoundTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
