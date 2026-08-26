import { formatResult } from "@challenger-fantasy/core";
import { Pill } from "./Pill";

// This component is used to display the result of a fight in a pill format
//
// ex. Winner: Adesanya • R3 Decision

interface FightResultPillProps {
  winnerName: string;
  resultMethod: string;
  resultRound: number;
}

export function FightResultPill({ winnerName, resultMethod, resultRound }: FightResultPillProps) {
  return (
    <div className="mt-2 text-center">
      <Pill color="green" size="sm" variant="regular">
        Winner: {winnerName}
        {resultMethod && resultRound && <> • {formatResult(resultMethod, resultRound)}</>}
      </Pill>
    </div>
  );
}
