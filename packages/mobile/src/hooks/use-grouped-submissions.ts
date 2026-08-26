import { sortSubmissions } from "@challenger-fantasy/core";
import type { SubmissionDto } from "@challenger-fantasy/schemas";
import type { InfinitePaginationOptions } from "@challenger-fantasy/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSupabase } from "~/hooks/use-supabase";
import { userSubmissionsInfiniteQuery } from "~/lib/init-queries";

type SubmissionGroup = {
  event: { id: string; name: string };
  submissions: SubmissionDto[];
};

export function useGroupedSubmissions(
  status: "upcoming" | "live" | "completed",
  { pageSize = 20 }: InfinitePaginationOptions = {},
) {
  const { userId } = useSupabase();
  const { data, fetchNextPage, hasNextPage, isLoading, isPending } = useInfiniteQuery(
    userSubmissionsInfiniteQuery(userId, { status, pageSize }),
  );

  const groups = useMemo<SubmissionGroup[]>(() => {
    if (!data) return [];
    const seen = new Set<string>();
    const map = new Map<string, SubmissionGroup>();
    for (const page of data.pages) {
      for (const s of page.submissions) {
        if (!s.event || seen.has(s.id)) continue;
        seen.add(s.id);
        const existing = map.get(s.event.id);
        if (existing) {
          existing.submissions.push(s);
        } else {
          map.set(s.event.id, { event: s.event, submissions: [s] });
        }
      }
    }
    return Array.from(map.values()).map((group) => ({
      ...group,
      submissions: sortSubmissions(group.submissions, status),
    }));
  }, [data, status]);

  return { groups, hasNextPage, fetchNextPage, isLoading, isPending };
}
