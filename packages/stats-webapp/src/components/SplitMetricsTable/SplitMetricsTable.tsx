import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SplitMetricsTableRowProps {
  leftValue: string | number | ReactNode;
  rightValue: string | number | ReactNode;
  label: string;
  compact?: boolean;
  isHeader?: boolean;
}

export function SplitMetricsTableRow({
  leftValue,
  rightValue,
  label,
  compact = false,
  isHeader = false,
}: SplitMetricsTableRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-7 items-center text-sm py-1 hover:bg-accent",
        compact && "grid-cols-7",
        isHeader && "font-bold bg-muted",
      )}
    >
      <div className={cn("text-center font-medium truncate col-span-2", compact && "col-span-2")}>
        {leftValue}
      </div>
      <div
        className={cn(
          "col-span-3 text-center text-muted-foreground uppercase text-xs px-1",
          compact && "col-span-3",
          isHeader && "font-bold",
        )}
      >
        {label}
      </div>
      <div className={cn("text-center font-medium truncate col-span-2", compact && "col-span-2")}>
        {rightValue}
      </div>
    </div>
  );
}

interface SplitMetricsTableProps {
  rows: Array<SplitMetricsTableRowProps>;
  title?: string;
  compact?: boolean;
  hasHeader?: boolean;
}

export function SplitMetricsTable({
  rows,
  title,
  compact = false,
  hasHeader = false,
}: SplitMetricsTableProps) {
  return (
    <>
      {title && (
        <div className="text-xs font-bold uppercase tracking-wide mb-1 text-center">{title}</div>
      )}
      <div className="divide-y divide-border">
        {rows.map((row, i) => (
          <SplitMetricsTableRow
            key={row.label}
            {...row}
            compact={compact}
            isHeader={hasHeader && i === 0}
          />
        ))}
      </div>
    </>
  );
}
