import { formatDate } from "@challenger-fantasy/core";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { singleEventQuery, singleFightQuery } from "@/lib/init-queries";

interface FightHeaderProps {
  eventIdOrSlug: string;
  fightIdOrSlug: string;
}

export function FightHeader({ eventIdOrSlug, fightIdOrSlug }: FightHeaderProps) {
  const [{ data: fight }, { data: event }] = useSuspenseQueries({
    queries: [singleFightQuery(fightIdOrSlug), singleEventQuery(eventIdOrSlug)],
  });

  // const location = formatEventLocation(event., fight.event_city, fight.event_country);

  return (
    <div>
      {/* Event details */}
      <div className="flex flex-wrap items-center justify-center text-[10px] text-muted-foreground">
        <Link
          to="/events/$eventIdOrSlug"
          params={{ eventIdOrSlug }}
          className="hover:text-blue-500"
        >
          {event.name}
        </Link>
        <span className="mx-1">•</span>
        <span>{formatDate(event.mainCardStartTimeUtc)}</span>
        {/* {location && <span className="mx-1">•</span>}
        {location && <span>{location}</span>} */}
      </div>

      {/* Main fight header */}
      <div className="flex flex-wrap items-center justify-center gap-x-4">
        <div className="flex items-center gap-2">
          {/* {fight.status === "final" && fight.result && <WinLossPill result={fight.result.result} fighterPosition="f1" />} */}
          <Link
            to="/fighters/$fighterIdOrSlug"
            params={{ fighterIdOrSlug: fight.fighter1.slug }}
            className="text-2xl font-bold hover:opacity-80"
          >
            {fight.fighter1.name}
          </Link>
        </div>

        <span className="text-xl font-bold text-muted-foreground">vs</span>

        <div className="flex items-center gap-2">
          <Link
            to="/fighters/$fighterIdOrSlug"
            params={{ fighterIdOrSlug: fight.fighter2.slug }}
            className="text-2xl font-bold hover:opacity-80"
          >
            {fight.fighter2.name}
          </Link>
          {/* {fight.status === "final" && <WinLossPill result={fight.result} fighterPosition="f2" />} */}
        </div>
      </div>
    </div>
  );
}
