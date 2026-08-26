import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { ShareButton } from "@/components/Buttons/ShareButton";
import { FighterHeader } from "@/components/Fighter/FighterHeader";
import { FighterInfoCard } from "@/components/Fighter/FighterInfo";
import { FighterStatsCard } from "@/components/Fighter/FighterStats";
import { LoadingPage1 } from "@/components/Pages/LoadingPage1";
import { useOnDemandExport } from "@/hooks/useOnDemandExport";
import { singleFighterAggregatedStatsQuery, singleFighterQuery } from "@/lib/init-queries";

export const Route = createFileRoute("/_app/fighters/$fighterIdOrSlug")({
  loader: async ({ context, params }) => {
    const [fighter] = await Promise.all([
      context.queryClient.ensureQueryData(singleFighterQuery(params.fighterIdOrSlug)),
      context.queryClient.ensureQueryData(
        singleFighterAggregatedStatsQuery(params.fighterIdOrSlug),
      ),
    ]);
    return fighter;
  },
  staticData: {
    getTitle: (loaderData: { name: string }) => loaderData.name,
  },
  component: FighterPage,
});

function FighterPage() {
  const { fighterIdOrSlug } = Route.useParams();

  const { OffscreenExport, prepareExport, cleanupExport, exportRef } = useOnDemandExport({
    width: 600,
    height: undefined,
  });

  const {
    data: fighterAggregatedStats,
    isLoading,
    error,
  } = useSuspenseQuery(singleFighterAggregatedStatsQuery(fighterIdOrSlug));

  if (isLoading) {
    return <LoadingPage1 />;
  }

  if (error || !fighterAggregatedStats) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <User className="size-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Fighter Not Found</h2>
          <p className="text-muted-foreground">
            The fighter you're looking for doesn't exist or couldn't be loaded.
          </p>
        </div>
      </div>
    );
  }

  // const perf5yr = calculateFightRecord(data?.wins, data?.losses, data?.draws, data?.no_contests);

  // const perfCareer = calculateFightRecord(
  //   headerAndStats.wins,
  //   headerAndStats.losses,
  //   headerAndStats.draws,
  //   headerAndStats.no_contests,
  // );

  return (
    <div className="page-container space-y-page-gap">
      <FighterHeader
        name={fighterAggregatedStats.fighterName}
        rightActions={
          <ShareButton
            targetRef={exportRef}
            filename={`${fighterAggregatedStats.fighterSlug}-overview.png`}
            buttonSize="icon"
            onPrepare={prepareExport}
            onCleanup={cleanupExport}
          />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-page-gap">
        <FighterInfoCard idOrSlug={fighterIdOrSlug} />
        {/* <FighterPerformanceCard
          records={[
            ...(isPending5yr ? [] : [{ label: "5 year", record: perf5yr }]),
            { label: "Career", record: perfCareer },
          ]}
        /> */}
      </div>

      <FighterStatsCard idOrSlug={fighterIdOrSlug} />

      {/* <FighterHistory idOrSlug={fighterIdOrSlug} /> */}

      <OffscreenExport aria-label="Fighter overview export">
        <div className="p-4 space-y-page-gap">
          <FighterHeader
            name={fighterAggregatedStats.fighterName}
            rightActions={
              <ShareButton
                targetRef={exportRef}
                filename={`${fighterAggregatedStats.fighterSlug}-overview.png`}
                buttonSize="icon"
                onPrepare={prepareExport}
                onCleanup={cleanupExport}
              />
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-page-gap">
            <FighterInfoCard idOrSlug={fighterIdOrSlug} />
            {/* <FighterPerformanceCard
              records={[
                { label: "Career", record: perfCareer },
                // { label: "5yr", record: perf5yr },
              ]}
            /> */}
          </div>

          <FighterStatsCard idOrSlug={fighterIdOrSlug} />
        </div>
      </OffscreenExport>
    </div>
  );
}
