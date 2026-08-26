import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Tables/Table";
import { dataClient } from "@/lib/data-client";
import { TableRowSkeletons } from "../LoadingUI/TableRowSkeletons";

interface HeroFighterEntriesTableProps {
  gameId: string;
}

function EntriesRows({ gameId }: HeroFighterEntriesTableProps) {
  const { data: gameEntries, isLoading: isLoadingGameEntries } = useQuery({
    queryKey: ["hero-fighter-game-entries", gameId],
    queryFn: () => dataClient.getHeroFighterGameEntries(gameId),
  });

  if (isLoadingGameEntries) {
    return <TableRowSkeletons keyPrefix="entry-table" columns={8} rows={3} />;
  }

  if (!gameEntries || gameEntries.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="text-center">
          No entries yet
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {gameEntries.map((entry, index) => (
        <TableRow key={entry.id}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{entry.username}</TableCell>
          <TableCell>{entry.head_fighter_id}</TableCell>
          <TableCell>{entry.arms_fighter_id}</TableCell>
          <TableCell>{entry.chest_fighter_id}</TableCell>
          <TableCell>{entry.legs_fighter_id}</TableCell>
          <TableCell>{entry.aura_fighter_id}</TableCell>
          <TableCell>{0}</TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function HeroFighterEntriesTable({ gameId }: HeroFighterEntriesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Head</TableHead>
          <TableHead>Arms</TableHead>
          <TableHead>Chest</TableHead>
          <TableHead>Legs</TableHead>
          <TableHead>Aura</TableHead>
          <TableHead>Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <EntriesRows gameId={gameId} />
      </TableBody>
    </Table>
  );
}
