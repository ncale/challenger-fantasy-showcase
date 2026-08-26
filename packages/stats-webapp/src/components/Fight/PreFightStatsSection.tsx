import { useOnDemandExport } from "@/hooks/useOnDemandExport";
import { ShareButton } from "../Buttons/ShareButton";
import { Card, CardContent, CardHeader, CardTitle } from "../Cards/Card";
import { PreFightMetricsTable } from "../SplitMetricsTable/PreFightMetricsTable";

interface PreFightStatsSectionProps {
  fightIdOrSlug: string;
}

export function PreFightStatsSection({ fightIdOrSlug }: PreFightStatsSectionProps) {
  const { exportRef, OffscreenExport, prepareExport, cleanupExport } = useOnDemandExport({
    width: 600,
    height: undefined,
  });

  return (
    <>
      <Card>
        <CardHeader className="my-3 relative">
          <ShareButton
            targetRef={exportRef}
            filename="pre-fight-stats.png"
            buttonSize="icon"
            onPrepare={prepareExport}
            onCleanup={cleanupExport}
            className="absolute top-0 right-0"
          />

          <div className="flex flex-col items-center justify-center gap-1">
            <CardTitle>Pre-Fight Stats</CardTitle>
            <div className="text-xs text-muted-foreground italic">Past 5 years (UFC fights)</div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4">
          <PreFightMetricsTable fightIdOrSlug={fightIdOrSlug} />
        </CardContent>
      </Card>

      <OffscreenExport aria-label="Fight breakdown export">
        <CardHeader className="my-3">
          <div className="flex flex-col items-center justify-center gap-1">
            <CardTitle>Pre-Fight Stats</CardTitle>
            <div className="text-xs text-muted-foreground italic">Past 5 years (UFC fights)</div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4">
          <PreFightMetricsTable fightIdOrSlug={fightIdOrSlug} />
        </CardContent>
      </OffscreenExport>
    </>
  );
}
