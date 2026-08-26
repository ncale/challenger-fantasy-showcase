import { TableCell, TableRow } from "../Tables/Table";
import { Skeleton } from "./Skeleton";

interface TableRowSkeletonsProps {
  keyPrefix: string;
  columns: number;
  rows?: number;
  className?: string;
}

/**
 * Renders a set of skeleton table rows for loading states.
 * @param keyPrefix Prefix for the key of the skeleton rows and cells
 * @param columns Number of skeleton columns per row
 * @param rows Number of skeleton rows to render (default: 3)
 * @param className Optional className for each Skeleton
 */
export function TableRowSkeletons({
  keyPrefix,
  rows = 3,
  columns,
  className,
}: TableRowSkeletonsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <skeleton rows do not have content>
        <TableRow key={`${keyPrefix}-row-${rowIdx}`}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <skeleton cells do not have content>
            <TableCell key={`${keyPrefix}-cell-${colIdx}`}>
              <Skeleton className={className ?? "h-4 w-16"} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
