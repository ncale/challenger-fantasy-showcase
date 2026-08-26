import type { FightDto } from "@challenger-fantasy/schemas";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Users } from "lucide-react";
import { eventCardQuery } from "@/lib/init-queries";
import { Card, CardContent, CardHeader, CardTitle } from "../Cards/Card";
import { InnerLink, LinkBox, LinkOverlay } from "../Linkbox/Linkbox";

interface FightRowProps {
  fight: FightDto;
  eventIdOrSlug: string;
  index: number;
}

function FightRow({ fight, eventIdOrSlug, index }: FightRowProps) {
  return (
    <LinkBox
      key={`${fight.id}-${index}`}
      className="block border border-border rounded-lg p-3 hover:bg-accent transition-shadow text-xs"
    >
      {/* Fight Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {/* {fight.is_title && (
            <div className="flex items-center gap-1">
              <Award className="size-3.5 text-yellow-500" />
              <span className="font-semibold text-yellow-600 uppercase">Title</span>
            </div>
          )} */}
          {fight.weightClass && (
            <span className="font-medium text-muted-foreground">{fight.weightClass} Bout</span>
          )}
          {/* {fight.weight_lbs && <span className="text-muted-foreground">{fight.weight_lbs} lbs</span>} */}
        </div>
      </div>

      {/* Fighters */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-left">
          <InnerLink
            to="/fighters/$fighterIdOrSlug"
            params={{ fighterIdOrSlug: fight.fighter1.slug }}
            className="font-semibold text-foreground hover:text-blue-500"
          >
            {fight.fighter1.name}
          </InnerLink>
        </div>

        <div className="px-4">
          <span className="font-medium text-muted-foreground">vs</span>
        </div>

        <div className="flex-1 text-right">
          <InnerLink
            to="/fighters/$fighterIdOrSlug"
            params={{ fighterIdOrSlug: fight.fighter2.slug }}
            className="font-semibold text-foreground hover:text-blue-500"
          >
            {fight.fighter2.name}
          </InnerLink>
        </div>
      </div>

      {/* Title Information */}
      {/* {fight.title_name && <TitleNamePill titleName={fight.title_name} />} */}

      {/* {fight.result && (
        <FightResultPill
          winnerName={getFightWinnerName(fight.status, fight.fighter1.name, fight.fighter2.name)}
          resultMethod={fight.result_method || ""}
          resultRound={fight.result_round || 0}
        />
      )} */}

      <LinkOverlay
        to="/events/$eventIdOrSlug/$fightIdOrSlug"
        params={{ eventIdOrSlug, fightIdOrSlug: fight.id }}
      />
    </LinkBox>
  );
}

export function EventFightsList({ eventIdOrSlug }: { eventIdOrSlug: string }) {
  const { data, isLoading, error } = useQuery(eventCardQuery(eventIdOrSlug));

  if (isLoading) {
    return <Card>Loading</Card>;
  }

  if (!data || !data.fights || data.fights.length === 0 || error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle kind="base" className="flex items-center gap-2">
            <Trophy className="size-4" />
            Fight Card
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Fights Available</h3>
            <p className="text-muted-foreground">
              Fight card information is not yet available for this event.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { fights } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle kind="base" className="flex items-center gap-2">
          <Trophy className="size-4" />
          Fight Card ({fights.length} fights)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fights.map((fight, index) => (
          <FightRow key={fight.id} fight={fight} eventIdOrSlug={eventIdOrSlug} index={index} />
        ))}
      </CardContent>
    </Card>
  );
}
