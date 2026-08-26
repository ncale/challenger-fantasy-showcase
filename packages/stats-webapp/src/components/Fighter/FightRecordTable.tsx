import type { PastFightRecord } from "@challenger-fantasy/types";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../Cards/Card";

interface FightRecordTableProps {
  records: {
    label: string;
    record: PastFightRecord;
  }[];
}
function FightRecordRow({
  label,
  record,
  isHeader = false,
}: {
  label: string;
  record: Partial<PastFightRecord>;
  isHeader?: boolean;
}) {
  const textStyle = isHeader ? "text-muted-foreground text-xs" : "font-medium text-sm";
  const bgStyle = isHeader ? "" : "bg-muted border-x";
  const bgStyleTotal = isHeader ? "" : "bg-muted border-x";

  return (
    <>
      <div className={cn("text-muted-foreground col-span-2")}>{label}</div>
      <div className={cn(textStyle, "text-center", bgStyle)}>{record.wins}</div>
      <div className={cn(textStyle, "text-center", bgStyle)}>{record.losses}</div>
      <div className={cn(textStyle, "text-center", bgStyle)}>{record.draws}</div>
      <div className={cn(textStyle, "text-center", bgStyle)}>{record.noContests}</div>
      <div className={cn(textStyle, "text-center col-span-2 text-muted-foreground", bgStyleTotal)}>
        {record.total}
      </div>
      <div className={cn(textStyle, "text-center col-span-2 text-muted-foreground", bgStyleTotal)}>
        {record.winRate}
      </div>
    </>
  );
}

export function FightRecordTable({ records }: FightRecordTableProps) {
  return (
    <div className="grid grid-cols-10 gap-1">
      <FightRecordRow
        label=""
        record={{
          wins: "W",
          losses: "L",
          draws: "D",
          noContests: "NC",
          total: "Total",
          winRate: "Win Rate",
        }}
        isHeader
      />

      {records.map(({ label, record }) => (
        <FightRecordRow key={label} label={label} record={record} />
      ))}
    </div>
  );
}

export function FighterPerformanceCard({ records }: FightRecordTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle kind="upper" className="flex items-center gap-2">
          <BarChart3 className="size-3.5" />
          Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FightRecordTable records={records} />
      </CardContent>
    </Card>
  );
}
