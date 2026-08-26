import { getFantasyStatsFormatted } from "@challenger-fantasy/core";
import type { HeroFighterFightersBreakdownView } from "@challenger-fantasy/types";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowSubHeader,
} from "@/components/Tables/Table";
import { useParsedStats } from "@/hooks/useParsedStats";
import { dataClient } from "@/lib/data-client";
import { TableRowSkeletons } from "../LoadingUI/TableRowSkeletons";

interface HeroFighterFightersBreakdownTableProps {
  gameId: string;
}

function FightersRow({ fighter }: { fighter: HeroFighterFightersBreakdownView }) {
  const { stats: off } = useParsedStats(fighter.offensive_stats);
  const { stats: def } = useParsedStats(fighter.defensive_stats);

  if (!off || !def || !fighter.total_seconds) return "missing data in this row";

  const stats = getFantasyStatsFormatted(off, def, fighter.total_seconds);

  return (
    <TableRow>
      <TableCell>{fighter.fighter_name}</TableCell>
      <TableCell className="font-mono text-right">{fighter.total_fights}</TableCell>
      <TableCell className="font-mono text-right">{stats.standingStrikes.landedPerRound}</TableCell>
      <TableCell className="font-mono text-right">{stats.groundStrikes.landedPerRound}</TableCell>
      <TableCell className="font-mono text-right">{stats.pctInControl}</TableCell>
      <TableCell className="font-mono text-right">{stats.tdsLandedPerRound}</TableCell>
      <TableCell className="font-mono text-right">{stats.kdsPerRound}</TableCell>
      <TableCell className="font-mono text-right">{stats.subAttemptsPerRound}</TableCell>
    </TableRow>
  );
}

function FightersRows({ gameId }: HeroFighterFightersBreakdownTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["hero-fighter-fighters-breakdown", gameId],
    queryFn: () => dataClient.getHeroFighterFightersBreakdown(gameId),
  });

  if (isLoading) {
    return <TableRowSkeletons keyPrefix="fighter-table" columns={8} rows={3} />;
  }

  if (!data || data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="text-center">
          No entries yet
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {data.map((fighter, i) => {
        const showSeparator = (() => {
          if (i === 0) return true;
          if (fighter.fight_order === null) return false;
          if (fighter.fight_order !== data[i - 1]?.fight_order) return true;
          return false;
        })();

        return (
          <>
            {showSeparator && <TableRowSubHeader name={`${fighter.fight_order}.`} colSpan={8} />}
            <FightersRow key={fighter.fighter_id} fighter={fighter} />
          </>
        );
      })}
    </>
  );
}

export function HeroFighterFightersBreakdownTable({
  gameId,
}: HeroFighterFightersBreakdownTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fighter</TableHead>
          <TableHead className="text-center">Fights</TableHead>
          <TableHead className="text-center">Standing/r</TableHead>
          <TableHead className="text-center">Ground/r</TableHead>
          <TableHead className="text-center">Ctrl Pct</TableHead>
          <TableHead className="text-center">TDs/r</TableHead>
          <TableHead className="text-center">KDs/r</TableHead>
          <TableHead className="text-center">SubAtt/r</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <FightersRows gameId={gameId} />
      </TableBody>
    </Table>
  );
}
