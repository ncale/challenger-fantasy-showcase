import { useSuspenseQuery } from "@tanstack/react-query";
import { singleFightQuery } from "@/lib/init-queries";
import { FightKeyMetricsTableCard } from "../SplitMetricsTable/FightKeyMetricsTable";

interface FightResultsProps {
  fightIdOrSlug: string;
}

export function FightResults({ fightIdOrSlug }: FightResultsProps) {
  const { data: fight } = useSuspenseQuery(singleFightQuery(fightIdOrSlug));

  if (fight.status !== "final") {
    return null;
  }

  return (
    <div className="space-y-page-gap">
      {fight.result && (
        <FightKeyMetricsTableCard
          f1Stats={fight.fighter1.stats}
          f2Stats={fight.fighter2.stats}
          f1Name={fight.fighter1.name}
          f2Name={fight.fighter2.name}
          winner={fight.result.result}
          resultMethod={fight.result.method}
          resultRound={fight.result.round}
        />
      )}

      {/* <FightBreakdownTableCard
        f1Name={fight.fighter1.name}
        f1Stats={fight.fighter1.stats}
        f2Name={fight.fighter2.name}
        f2Stats={fight.fighter2.stats}
        roundSnapshots={fight.roundSnapshots}
      /> */}
    </div>
  );
}
