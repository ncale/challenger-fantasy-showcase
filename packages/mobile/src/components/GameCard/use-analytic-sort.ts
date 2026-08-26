import type { AnalyticsStatKey, FighterContextStatKey } from "@challenger-fantasy/shared";
import { useCallback, useState } from "react";

export type SortKey = AnalyticsStatKey | FighterContextStatKey;
export type AnalyticsSortState = { key: SortKey; direction: "desc" | "asc" } | null;

type UseAnalyticSortReturn = {
  analyticSort: AnalyticsSortState;
  handleStatPress: (key: SortKey) => void;
  clearSort: () => void;
  showFightCards: boolean;
};

export function useAnalyticSort(): UseAnalyticSortReturn {
  const [analyticSort, setAnalyticSort] = useState<AnalyticsSortState>(null);

  const handleStatPress = useCallback((key: SortKey) => {
    setAnalyticSort((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "desc" ? "asc" : "desc" };
      }
      return { key, direction: "desc" };
    });
  }, []);

  const clearSort = useCallback(() => setAnalyticSort(null), []);

  return { analyticSort, handleStatPress, clearSort, showFightCards: analyticSort === null };
}
