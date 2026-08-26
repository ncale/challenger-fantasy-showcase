import {
  formatPositiveInt,
  getFightKeyMetricsFormatted,
  getFightWinnerName,
  shortenName,
} from "@challenger-fantasy/core";
import type { FighterRoundStatsV1 } from "@challenger-fantasy/schemas";
import type { FightWinner } from "@challenger-fantasy/types";
import { useOnDemandExport } from "@/hooks/useOnDemandExport";
import { ShareButton } from "../Buttons/ShareButton";
import { Card } from "../Cards/Card";
import { FightResultPill } from "../Pill/FightResultPill";
import { SplitMetricsTable } from "./SplitMetricsTable";

interface FightKeyMetricsTableProps {
  f1Stats: FighterRoundStatsV1;
  f2Stats: FighterRoundStatsV1;
  f1Name: string;
  f2Name: string;
  winner: FightWinner;
  resultMethod: string;
  resultRound: number;
}

export function FightKeyMetricsTableCard({
  f1Stats,
  f2Stats,
  f1Name,
  f2Name,
  winner,
  resultMethod,
  resultRound,
}: FightKeyMetricsTableProps) {
  const { exportRef, OffscreenExport, prepareExport, cleanupExport } = useOnDemandExport({
    width: 530,
    height: undefined,
  });

  return (
    <>
      <Card>
        <div className="relative p-2 rounded-md">
          <div className="grid grid-cols-3 items-center">
            <div />

            <div className="text-xs font-bold uppercase tracking-wide text-center flex-1">
              Fight Results
            </div>

            <div className="justify-self-end">
              <ShareButton
                targetRef={exportRef}
                filename="fight-key-metrics.png"
                buttonSize="icon"
                onPrepare={prepareExport}
                onCleanup={cleanupExport}
              />
            </div>
          </div>

          <div className="mb-3">
            hello
            <FightResultPill
              winnerName={getFightWinnerName(winner, f1Name, f2Name)}
              resultMethod={resultMethod}
              resultRound={resultRound}
            />
          </div>

          <FightKeyMetricsTable
            f1Stats={f1Stats}
            f2Stats={f2Stats}
            f1Name={f1Name}
            f2Name={f2Name}
            winner={winner}
            resultMethod={resultMethod}
            resultRound={resultRound}
          />
        </div>
      </Card>

      <OffscreenExport aria-label="Fight key metrics export">
        <div className="flex items-center justify-center p-4 pb-2">
          <div className="text-base font-bold uppercase tracking-wide text-center">
            Fight Results
          </div>
        </div>

        <div className="mb-3">
          <FightResultPill
            winnerName={getFightWinnerName(winner, f1Name, f2Name)}
            resultMethod={resultMethod}
            resultRound={resultRound}
          />
        </div>

        <div className="p-4">
          <FightKeyMetricsTable
            f1Stats={f1Stats}
            f2Stats={f2Stats}
            f1Name={f1Name}
            f2Name={f2Name}
            winner={winner}
            resultMethod={resultMethod}
            resultRound={resultRound}
          />
        </div>
      </OffscreenExport>
    </>
  );
}

function FightKeyMetricsTable({
  f1Stats,
  f2Stats,
  f1Name,
  f2Name,
  winner,
}: FightKeyMetricsTableProps) {
  const keyMetrics = getFightKeyMetricsFormatted(f1Stats, f2Stats);

  const f1Header = (
    <>
      {shortenName(f1Name)}{" "}
      <span className="font-mono font-bold">{winner === "f1" ? "(W)" : "(L)"}</span>
    </>
  );
  const f2Header = (
    <>
      {shortenName(f2Name)}{" "}
      <span className="font-mono font-bold">{winner === "f2" ? "(W)" : "(L)"}</span>
    </>
  );

  const rows = [
    {
      leftValue: f1Header,
      rightValue: f2Header,
      label: "Fighters",
    },
    {
      leftValue: formatPositiveInt(keyMetrics.f1Finishes),
      rightValue: formatPositiveInt(keyMetrics.f2Finishes),
      label: "Finish attempts (KD + Sub)",
    },
    {
      leftValue: keyMetrics.f1StrikeDiff,
      rightValue: keyMetrics.f2StrikeDiff,
      label: "Sig strike differential",
    },
    {
      leftValue: keyMetrics.f1SigPct,
      rightValue: keyMetrics.f2SigPct,
      label: "Pct of total sig strikes",
    },
    {
      leftValue: keyMetrics.f1CtrlDiff,
      rightValue: keyMetrics.f2CtrlDiff,
      label: "Control time differential",
    },
    {
      leftValue: keyMetrics.f1CtrlPct,
      rightValue: keyMetrics.f2CtrlPct,
      label: "Pct of total control time",
    },
  ];

  return <SplitMetricsTable rows={rows} hasHeader />;
}
