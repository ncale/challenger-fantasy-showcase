import { getWeightCodeFromKey } from "@challenger-fantasy/core";
import type { FighterAnalyticsDto } from "@challenger-fantasy/schemas";
import { useMemo } from "react";
import { useEventCardWithCacheSeed } from "~/lib/init-queries";

export type EventCardFighter = {
  id: string;
  name: string;
  slug: string;
  opponent: { id: string; name: string };
  winProbability: number | null | undefined;
  fightWeightKey: string | undefined;
  fightOrder: number;
  weightClass: string | undefined;
  weightClassKey: string;
  analytics: FighterAnalyticsDto | undefined;
};

type EventCardFight = {
  id: string;
  order: number;
  weightClass: string | undefined;
  weightClassKey: string;
  fighter1: EventCardFighter;
  fighter2: EventCardFighter;
};

export function useEventCard(eventId: string | undefined) {
  const { data: cardData } = useEventCardWithCacheSeed(eventId, { bustCache: true });

  const { fighters, fighterMap, fights, fightMap } = useMemo(() => {
    if (!cardData) {
      return {
        fighters: [] as EventCardFighter[],
        fighterMap: new Map<string, EventCardFighter>(),
        fights: [] as EventCardFight[],
        fightMap: new Map<string, EventCardFight>(),
      };
    }

    const infoMap = new Map(cardData.fighterEventInfo.map((info) => [info.fighterId, info]));
    const analyticsMap = new Map(cardData.fighterAnalytics.map((a) => [a.fighterId, a]));

    const normalizedFights: EventCardFight[] = [...cardData.fights]
      .sort((a, b) => a.order - b.order)
      .map((fight) => {
        let weightClass: string | undefined;
        try {
          weightClass = getWeightCodeFromKey(fight.weightClassKey);
        } catch {
          weightClass = undefined;
        }

        const makeFighter = (
          simple: { id: string; name: string; slug: string },
          opponent: { id: string; name: string; slug: string },
        ): EventCardFighter => {
          const info = infoMap.get(simple.id);
          return {
            id: simple.id,
            name: simple.name,
            slug: simple.slug,
            opponent: { id: opponent.id, name: opponent.name },
            winProbability: info?.winProbability,
            fightWeightKey: info?.fightWeightKey,
            fightOrder: fight.order,
            weightClass,
            weightClassKey: fight.weightClassKey,
            analytics: analyticsMap.get(simple.id),
          };
        };

        return {
          id: fight.id,
          order: fight.order,
          weightClass,
          weightClassKey: fight.weightClassKey,
          fighter1: makeFighter(fight.fighter1, fight.fighter2),
          fighter2: makeFighter(fight.fighter2, fight.fighter1),
        };
      });

    const normalizedFighters = normalizedFights.flatMap((f) => [f.fighter1, f.fighter2]);

    return {
      fighters: normalizedFighters,
      fighterMap: new Map(normalizedFighters.map((f) => [f.id, f])),
      fights: normalizedFights,
      fightMap: new Map(normalizedFights.map((f) => [f.id, f])),
    };
  }, [cardData]);

  return { fighters, fighterMap, fights, fightMap, isReady: cardData != null };
}
