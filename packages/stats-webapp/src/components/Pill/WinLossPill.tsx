import { Pill } from "./Pill";

export function WinLossPill({ result, className }: { result: string; className?: string }) {
  const color = (() => {
    if (result === "W") return "green";
    if (result === "L") return "red";
    if (result === "D") return "gray";
    if (result === "NC") return "gray";
    throw new Error(`Invalid result: ${result}`);
  })();

  return (
    <Pill color={color} size="md" variant="circular" className={className}>
      {result}
    </Pill>
  );
}
