import { getAge } from "@challenger-fantasy/core";
import type { FighterColumns } from "@challenger-fantasy/types";
import { useQuery } from "@tanstack/react-query";
import { SortAsc, SortDesc } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Tables/Table";
import { dataClient } from "@/lib/data-client";
import { Button } from "../Buttons/Button";

type Limit = 10 | 15 | 20;
const LIMIT_OPTIONS: Limit[] = [10, 15, 20];

type SortOrder = "asc" | "desc";

function TableHeadWithSort({
  children,
  toggleSort,
  sortOrder,
}: {
  children: React.ReactNode;
  toggleSort: (sortBy: FighterColumns) => void;
  sortOrder?: SortOrder;
}) {
  return (
    <TableHead>
      <button
        onClick={() => toggleSort("full_name")}
        type="button"
        className="flex items-center gap-2"
      >
        {children}
        {sortOrder === "asc" && <SortAsc className="size-4" />}
        {sortOrder === "desc" && <SortDesc className="size-4" />}
      </button>
    </TableHead>
  );
}

export function FighterExplorerTable() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState<Limit>(15);
  const [sortBy, setSortBy] = useState<FighterColumns>("full_name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const { data, isLoading, error } = useQuery({
    queryKey: ["fighters", offset, limit, sortBy, sortOrder],
    queryFn: () => dataClient.getFighters({ offset, limit, sortBy, sortOrder }),
    placeholderData: (previousData) => previousData,
  });

  const toggleSort = (sortBy: FighterColumns) => {
    setSortBy(sortBy);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading fighters: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"></div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeadWithSort
                toggleSort={() => toggleSort("full_name")}
                sortOrder={sortBy === "full_name" ? sortOrder : undefined}
              >
                Fighter
              </TableHeadWithSort>
              <TableHeadWithSort
                toggleSort={() => toggleSort("dob")}
                sortOrder={sortBy === "dob" ? sortOrder : undefined}
              >
                Age
              </TableHeadWithSort>
              <TableHead>Height</TableHead>
              <TableHead>Reach</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Stance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading fighters...
                </TableCell>
              </TableRow>
            ) : data?.length ? (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell key={row.id}>{row.full_name}</TableCell>
                  <TableCell key={row.id}>{getAge(new Date(row.dob || ""))}</TableCell>
                  <TableCell key={row.id}>{row.height_in}</TableCell>
                  <TableCell key={row.id}>{row.reach_in}</TableCell>
                  <TableCell key={row.id}>{row.weight_lbs}</TableCell>
                  <TableCell key={row.id}>{row.stance}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No fighters found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Show</span>
          <select
            className="rounded border px-2 py-1 bg-background text-foreground"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) as Limit)}
          >
            {LIMIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>fighters</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(offset - 1)}
            disabled={offset === 0}
          >
            Prev
          </Button>

          <div className="min-w-4 rounded-md text-sm font-medium text-center">{offset + 1}</div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(offset + 1)}
            disabled={offset === Math.ceil(data?.length || 0 / limit || 0) - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
