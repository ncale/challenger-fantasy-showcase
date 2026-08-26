import { calculateApeIndex, getAge, getSummaryStatsFormatted } from "@challenger-fantasy/core";
import { useQueries, useSuspenseQueries } from "@tanstack/react-query";
import { preFightStatsQuery, singleFighterQuery, singleFightQuery } from "@/lib/init-queries";
import { SplitMetricsTable } from "./SplitMetricsTable";

// type FighterMeta = {
//   name: string;
//   stats: FighterRoundStatsV1;
//   oppStats: FighterRoundStatsV1;
//   totalSeconds: number;
//   record: PastFightRecord | null;
//   ageYears?: string | null;
//   heightIn?: number | null;
//   reachIn?: number | null;
//   stance?: string | null;
// };

interface PreFightMetricsTableProps {
  fightIdOrSlug: string;
}

export function PreFightMetricsTable({ fightIdOrSlug }: PreFightMetricsTableProps) {
  const [{ data: fight }, { data: preFightStats }] = useSuspenseQueries({
    queries: [singleFightQuery(fightIdOrSlug), preFightStatsQuery(fightIdOrSlug)],
  });

  const [{ data: fighter1 }, { data: fighter2 }] = useQueries({
    queries: [singleFighterQuery(fight.fighter1.id), singleFighterQuery(fight.fighter2.id)],
  });

  if (!fighter1 || !fighter2) return <>loading</>;

  const f1Summary = getSummaryStatsFormatted(
    preFightStats.fighter1.offensiveStats,
    preFightStats.fighter1.defensiveStats,
    preFightStats.fighter1.totalSeconds,
  );
  const f2Summary = getSummaryStatsFormatted(
    preFightStats.fighter2.offensiveStats,
    preFightStats.fighter2.defensiveStats,
    preFightStats.fighter2.totalSeconds,
  );

  const f1Size = calculateApeIndex(fighter1?.heightIn ?? null, fighter1?.reachIn ?? null);
  const f2Size = calculateApeIndex(fighter1?.heightIn ?? null, fighter1?.reachIn ?? null);

  const topRows = [
    {
      label: "FIGHTERS",
      leftValue: fighter1?.name,
      rightValue: fighter2?.name,
    },
    // {
    //   label: "RECORD",
    //   leftValue: getFightRecordString(f1.record),
    //   rightValue: getFightRecordString(f2.record),
    // },
    // {
    //   label: "WIN RATE",
    //   leftValue: f1.record.winRate,
    //   rightValue: f2.record.winRate,
    // },
  ];

  const physicalMetricsRows = [
    {
      label: "AGE",
      leftValue: getAge(fighter1.dob),
      rightValue: getAge(fighter2.dob),
    },

    {
      label: "HEIGHT",
      leftValue: f1Size.height,
      rightValue: f2Size.height,
    },
    {
      label: "REACH",
      leftValue: f1Size.reach,
      rightValue: f2Size.reach,
    },

    {
      label: "STANCE",
      leftValue: fighter1.stance?.toUpperCase() ?? "-",
      rightValue: fighter2.stance?.toUpperCase() ?? "-",
    },
  ];

  const sigStrikingRows = [
    {
      label: "LANDED / ROUND",
      leftValue: f1Summary.strikesLandedPerRound,
      rightValue: f2Summary.strikesLandedPerRound,
    },
    {
      label: "ABSORBED / ROUND",
      leftValue: f1Summary.strikesAbsorbedPerRound,
      rightValue: f2Summary.strikesAbsorbedPerRound,
    },
    {
      label: "DIFFERENTIAL",
      leftValue: f1Summary.strikesLandedPerRoundDiff,
      rightValue: f2Summary.strikesLandedPerRoundDiff,
    },
  ];

  const controlRows = [
    {
      label: "IN CONTROL",
      leftValue: f1Summary.pctInControl,
      rightValue: f2Summary.pctInControl,
    },
    {
      label: "UNDER CONTROL",
      leftValue: f1Summary.pctUnderControl,
      rightValue: f2Summary.pctUnderControl,
    },
    {
      label: "DIFFERENTIAL",
      leftValue: f1Summary.controlDiff,
      rightValue: f2Summary.controlDiff,
    },
  ];

  const tdRows = [
    {
      label: "LANDED / ROUND",
      leftValue: f1Summary.tdsLandedPerRound,
      rightValue: f2Summary.tdsLandedPerRound,
    },
    {
      label: "ABSORBED / ROUND",
      leftValue: f1Summary.tdsAbsorbedPerRound,
      rightValue: f2Summary.tdsAbsorbedPerRound,
    },
    {
      label: "DIFFERENTIAL",
      leftValue: f1Summary.tdsLandedPerRoundDiff,
      rightValue: f2Summary.tdsLandedPerRoundDiff,
    },
  ];

  const finishRows = [
    {
      label: "KDs / ROUND",
      leftValue: f1Summary.kdsPerRound,
      rightValue: f2Summary.kdsPerRound,
    },
    {
      label: "SubAtt / ROUND",
      leftValue: f1Summary.subAttemptsPerRound,
      rightValue: f2Summary.subAttemptsPerRound,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SplitMetricsTable rows={topRows} title="" compact hasHeader />
      <SplitMetricsTable rows={physicalMetricsRows} title="Physical Metrics" compact />
      <SplitMetricsTable rows={sigStrikingRows} title="Significant Striking" compact />
      <SplitMetricsTable rows={controlRows} title="Control Time" compact />
      <SplitMetricsTable rows={tdRows} title="Takedowns" compact />
      <SplitMetricsTable rows={finishRows} title="Finishing Ability" compact />
    </div>
  );
}
