import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { StatusType } from "~/components/StatusDot";
import { useDraftRegistry } from "~/hooks/use-draft-registry";
import { useSupabase } from "~/hooks/use-supabase";
import { userSubmissionCountsQuery } from "~/lib/init-queries";

interface TrackStatus {
  navStatus: StatusType | null;
}

export const useTrackStatus = (): TrackStatus => {
  const { isDrafting } = useDraftRegistry();
  const { userId } = useSupabase();

  const { data: counts } = useQuery(userSubmissionCountsQuery(userId ?? undefined));
  const isLive = (counts?.live ?? 0) > 0;

  const navStatus = useMemo(() => {
    if (isDrafting) return "active-draft";
    if (isLive) return "live";
    return null;
  }, []);

  return { navStatus };
};
