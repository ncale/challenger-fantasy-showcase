import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { mobileLogger } from "~/lib/logger";

export function QueryLogger() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated") {
        const { query } = event;
        if (query.state.status === "success") {
          mobileLogger.query.info(
            { key: query.queryKey, durationMs: query.state.dataUpdatedAt },
            "query.success",
          );
        }
        if (query.state.status === "error") {
          mobileLogger.query.error(
            { key: query.queryKey, error: query.state.error },
            "query.failed",
          );
        }
      }
    });
    return unsubscribe;
  }, [queryClient]);

  return null;
}
