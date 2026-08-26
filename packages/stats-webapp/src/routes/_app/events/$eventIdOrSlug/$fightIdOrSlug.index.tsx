import { isNullish } from "@challenger-fantasy/core";
import { useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, useEffect } from "react";
import { FightHeader } from "@/components/Fight/FightHeader";
import { FightResults } from "@/components/Fight/FightResults";
import { PreFightStatsSection } from "@/components/Fight/PreFightStatsSection";
import { LoadingPage2 } from "@/components/Pages/LoadingPage2";
import { singleEventQuery, singleFightQuery } from "@/lib/init-queries";

export const Route = createFileRoute("/_app/events/$eventIdOrSlug/$fightIdOrSlug/")({
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(singleFightQuery(params.fightIdOrSlug));
  },
  staticData: {
    getTitle: (loaderData: { fighter1: { name: string }; fighter2: { name: string } }) =>
      `${loaderData.fighter1.name} vs ${loaderData.fighter2.name}`,
  },
  component: FightPage,
});

function FightPage() {
  const { eventIdOrSlug, fightIdOrSlug } = Route.useParams();

  // validate that the fight belongs to the event, otherwise navigate to the event page
  const navigate = useNavigate();
  const [{ data: event }, { data: fight }] = useSuspenseQueries({
    queries: [singleEventQuery(eventIdOrSlug), singleFightQuery(fightIdOrSlug)],
  });
  useEffect(() => {
    if (isNullish(event.id) || isNullish(fight.eventId)) return;

    if (event.id !== fight.eventId) {
      navigate({ to: "/events/$eventIdOrSlug", params: { eventIdOrSlug: event.slug } });
    }
  }, [event, fight, navigate]);

  return (
    <div className="page-container space-y-page-gap">
      <Suspense fallback={<LoadingPage2 />}>
        <FightHeader eventIdOrSlug={eventIdOrSlug} fightIdOrSlug={fightIdOrSlug} />

        <FightResults fightIdOrSlug={fightIdOrSlug} />

        <PreFightStatsSection fightIdOrSlug={fightIdOrSlug} />
      </Suspense>
    </div>
  );
}
