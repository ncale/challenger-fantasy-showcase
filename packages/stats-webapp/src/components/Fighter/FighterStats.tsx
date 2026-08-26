import { getSummaryStatsFormatted } from "@challenger-fantasy/core";
import { useQuery } from "@tanstack/react-query";
import { Target } from "lucide-react";
import { singleFighterAggregatedStatsQuery } from "@/lib/init-queries";
import { Card, CardContent, CardHeader, CardTitle } from "../Cards/Card";
import { SkeletonCard } from "../LoadingUI/SkeletonCard";

interface StatsSection {
  title: string;
  rows: {
    label: string;
    value: string;
  }[];
}

interface StatsSectionProps {
  section: StatsSection;
}

function StatsSection({ section }: StatsSectionProps) {
  return (
    <div className="space-y-1 text-sm">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
        {section.title}
      </div>
      {section.rows.map((row) => (
        <div key={row.label} className="flex justify-between">
          <span className="text-muted-foreground">{row.label}</span>
          <span className="font-mono font-medium">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

interface FighterStatsCardProps {
  idOrSlug: string;
}

export function FighterStatsCard({ idOrSlug }: FighterStatsCardProps) {
  const { data, isLoading, error } = useQuery(singleFighterAggregatedStatsQuery(idOrSlug));

  if (isLoading) {
    return <SkeletonCard />;
  }
  if (error) {
    return <div>Error loading fighter stats.</div>;
  }

  const { offensiveStats, defensiveStats } = data || {};

  if (!offensiveStats || !defensiveStats || !data || !data.totalSeconds) {
    return null;
  }

  const {
    strikesLandedPerRound,
    strikesAbsorbedPerRound,
    strikesLandedPerRoundDiff,
    pctInControl,
    pctUnderControl,
    controlDiff,
    tdsLandedPerRound,
    tdsAbsorbedPerRound,
    tdsLandedPerRoundDiff,
    offTdsAttemptedRatio,
    defTdsAttemptedRatio,
    kdsPerRound,
    subAttemptsPerRound,
  } = getSummaryStatsFormatted(offensiveStats, defensiveStats, data.totalSeconds);

  const sections: StatsSection[] = [
    {
      title: "Significant Striking",
      rows: [
        { label: "Landed/round", value: strikesLandedPerRound },
        { label: "Absorbed/round", value: strikesAbsorbedPerRound },
        { label: "Differential", value: strikesLandedPerRoundDiff },
      ],
    },
    {
      title: "Control Time",
      rows: [
        { label: "In Control", value: pctInControl },
        { label: "Under Control", value: pctUnderControl },
        { label: "Differential", value: controlDiff },
      ],
    },
    {
      title: "Takedowns",
      rows: [
        { label: "Landed/round", value: tdsLandedPerRound },
        { label: "Absorbed/round", value: tdsAbsorbedPerRound },
        { label: "Differential", value: tdsLandedPerRoundDiff },
      ],
    },
    {
      title: "TD Attempt Ratios",
      rows: [
        { label: "Offensive", value: offTdsAttemptedRatio },
        { label: "Defensive", value: defTdsAttemptedRatio },
      ],
    },
    {
      title: "Finishing Ability",
      rows: [
        { label: "KDs/round", value: kdsPerRound },
        { label: "SubAtt/round", value: subAttemptsPerRound },
      ],
    },
  ];

  return (
    <Card className="mb-3">
      <CardHeader>
        <CardTitle kind="upper" className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5" />
          High-Level Stats (5yr)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {sections.map((section) => (
            <StatsSection key={section.title} section={section} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
