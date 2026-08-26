import {
  applyClassIfZero,
  formatMinutesSeconds,
  formatPositiveInt,
  shortenName,
} from "@challenger-fantasy/core";
import type { FighterRoundStatsV1, RoundSnapshots } from "@challenger-fantasy/schemas";
import React from "react";
import { useOnDemandExport } from "@/hooks/useOnDemandExport";
import { cn } from "@/lib/utils";
import { ShareButton } from "../Buttons/ShareButton";
import { Card } from "../Cards/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowSubHeader,
} from "./Table";

interface FightBreakdownTableProps {
  f1Name: string;
  f2Name: string;
  f1Stats: FighterRoundStatsV1;
  f2Stats: FighterRoundStatsV1;
  roundSnapshots: RoundSnapshots;
}

export function FightBreakdownTableCard({
  f1Name,
  f2Name,
  f1Stats,
  f2Stats,
  roundSnapshots,
}: FightBreakdownTableProps) {
  const { exportRef, OffscreenExport, prepareExport, cleanupExport } = useOnDemandExport({
    width: 600,
    height: undefined,
  });

  return (
    <>
      <Card>
        <div className="relative p-2 pb-5 rounded-md export-container">
          <div className="grid grid-cols-3 items-center mb-2">
            <div />
            <div className="text-xs font-bold uppercase tracking-wide text-center flex-1">
              Fight Breakdown
            </div>
            <div className="justify-self-end">
              <ShareButton
                targetRef={exportRef}
                filename="fight-breakdown.png"
                buttonSize="icon"
                onPrepare={prepareExport}
                onCleanup={cleanupExport}
              />
            </div>
          </div>

          <FightBreakdownTable
            f1Name={f1Name}
            f1Stats={f1Stats}
            f2Name={f2Name}
            f2Stats={f2Stats}
            roundSnapshots={roundSnapshots}
          />
        </div>
      </Card>

      <OffscreenExport aria-label="Fight breakdown export">
        <div className="flex items-center justify-center p-4 pb-2">
          <div className="text-base font-bold uppercase tracking-wide text-center">
            Fight Breakdown
          </div>
        </div>

        <div className="p-4">
          <FightBreakdownTable
            f1Name={f1Name}
            f1Stats={f1Stats}
            f2Name={f2Name}
            f2Stats={f2Stats}
            roundSnapshots={roundSnapshots}
          />
        </div>
      </OffscreenExport>
    </>
  );
}

function FightBreakdownRow({ name, stats }: { name: string; stats: FighterRoundStatsV1 }) {
  const sigStrikes = formatPositiveInt(stats.general.significantStrikes.landed);
  const totalStrikes = formatPositiveInt(stats.general.totalStrikes.landed);
  const knockdowns = formatPositiveInt(stats.general.knockdowns);
  const submissions = formatPositiveInt(stats.general.submissionAttempts);
  const takedowns = formatPositiveInt(stats.general.takedowns.landed);
  const reversals = formatPositiveInt(stats.general.reversals);
  const controlTime = formatMinutesSeconds(stats.general.controlTimeSeconds);

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell className={cn("text-center", applyClassIfZero(sigStrikes))}>
        {sigStrikes}
      </TableCell>
      <TableCell className={cn("text-center", applyClassIfZero(totalStrikes))}>
        {totalStrikes}
      </TableCell>
      <TableCell className={cn("text-center", applyClassIfZero(knockdowns))}>
        {knockdowns}
      </TableCell>
      <TableCell className={cn("text-center", applyClassIfZero(submissions))}>
        {submissions}
      </TableCell>
      <TableCell className={cn("text-center", applyClassIfZero(takedowns))}>{takedowns}</TableCell>
      <TableCell className={cn("text-center", applyClassIfZero(reversals))}>{reversals}</TableCell>
      <TableCell className={"text-center"}>{controlTime}</TableCell>
    </TableRow>
  );
}

function FightBreakdownTable({
  f1Name,
  f1Stats,
  f2Name,
  f2Stats,
  roundSnapshots,
}: FightBreakdownTableProps) {
  const f1ShortName = shortenName(f1Name);
  const f2ShortName = shortenName(f2Name);

  return (
    <div>
      {/* Detailed stats table (fighters as rows, stats as columns) */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-8 text-center">Sig. Strs</TableHead>
              <TableHead className="w-8 text-center">Total Strs</TableHead>
              <TableHead className="w-8 text-center">KD</TableHead>
              <TableHead className="w-8 text-center">Sub Att</TableHead>
              <TableHead className="w-8 text-center">TD</TableHead>
              <TableHead className="w-8 text-center">Reversals</TableHead>
              <TableHead className="w-8 text-center">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRowSubHeader name="Overall" colSpan={8} />
            <FightBreakdownRow name={f1ShortName} stats={f1Stats} />
            <FightBreakdownRow name={f2ShortName} stats={f2Stats} />

            {roundSnapshots.map((snapshot) => (
              <React.Fragment key={`round-${snapshot.round}`}>
                {/* <FightBreakdownHeader name={`Round ${snapshot.round}`} /> */}
                <TableRowSubHeader
                  name={Array.from({ length: snapshot.round }, () => "•").join(" ")}
                  className="font-extrabold"
                  colSpan={8}
                />
                <FightBreakdownRow
                  key={`f1-round-${snapshot.round}`}
                  name={f1ShortName}
                  stats={snapshot.fighter_1_stats}
                />
                <FightBreakdownRow
                  key={`f2-round-${snapshot.round}`}
                  name={f2ShortName}
                  stats={snapshot.fighter_2_stats}
                />
                {/* {i < roundSnapshots.length - 1 && <FightBreakdownSeparator />} */}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
