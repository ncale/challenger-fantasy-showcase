import { Award } from "lucide-react";
import { LinkBox } from "../Linkbox/Linkbox";

interface FightResultIndicatorProps {
  // result: FightResult | null;
  fighterPosition: "f1" | "f2";
  fightStatus: string;
  isTitle?: boolean;
}

function FightResultIndicator({
  // result,
  fighterPosition,
  fightStatus,
  isTitle,
}: FightResultIndicatorProps) {
  if (fightStatus !== "final") {
    return (
      <div className="flex items-center min-w-[40px]">
        <span className="text-[10px] text-muted-foreground">NEXT</span>
        {isTitle && <Award className="size-3.5 text-yellow-500 ml-1" aria-label="Title Fight" />}
      </div>
    );
  }

  // if (!result) {
  //   // this should never happen
  //   // TODO: capture in sentry

  //   return null;
  // }

  // const resultColor = (() => {
  //   if (resultText === "W") return "text-green-500";
  //   if (resultText === "L") return "text-red-500";
  //   if (resultText === "D" || resultText === "NC") return "text-muted-foreground";
  //   throw new Error(`Invalid fight result: ${resultText}`);
  // })();

  return (
    <div className="flex items-center min-w-[40px]">
      {/* <span className={`font-medium ${resultColor}`}>{resultText}</span> */}
      {isTitle && <Award className="size-3.5 text-yellow-500 ml-1" aria-label="Title Fight" />}
    </div>
  );
}

interface FightRowProps {
  fight: never;
  fighterId: string;
}

function FightRow() {
  // const fighterPosition = fighterId === fight.fighter_1_id ? "f1" : "f2";

  // // Determine opponent based on fighter ID
  // const isOpponentFighter1 = fight.fighter_2_id === fighterId;
  // const opponentName = isOpponentFighter1 ? fight.fighter_1_name : fight.fighter_2_name;
  // const opponentSlug = kebab(opponentName);

  return (
    <LinkBox className="block py-2 hover:bg-accent">
      {/* Desktop version */}
      <div className="hidden sm:flex flex-row items-center gap-x-2">
        {/* Left aligned content */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 flex-1">
          {/* <FightResultIndicator
            result={fight.result}
            fighterPosition={fighterPosition}
            fightStatus={fight.status}
            isTitle={fight.is_title}
          /> */}

          {/* Fighter name */}
          {/* <InnerLink
            to="/fighters/$fighterSlug"
            params={{ fighterSlug: opponentSlug }}
            className="text-blue-500 font-medium"
          >
            {opponentName || "N/A"}
          </InnerLink> */}

          {/* Weight class */}
          {/* <div className="text-muted-foreground text-xs">{fight.weight_class || "N/A"}</div> */}
        </div>

        {/* Right aligned content */}
        <div className="flex items-center gap-2 ml-auto text-xs">
          {/* Result and round */}
          <div className="text-right whitespace-nowrap">
            {/* {fight.result_method && `${fight.result_method} `}
            {fight.result_round && `R${fight.result_round}`} */}
          </div>

          {/* Date */}
          <div className="text-right text-muted-foreground min-w-[70px]">
            {/* {fight.event_date ? new Date(fight.event_date).toLocaleDateString() : "N/A"} */}
          </div>
        </div>
      </div>

      {/* Mobile version */}
      <div className="flex sm:hidden justify-between items-center">
        <div className="flex items-center gap-2">
          {/* <FightResultIndicator
            result={fight.result}
            fighterPosition={fighterPosition}
            fightStatus={fight.status}
            isTitle={fight.is_title}
          /> */}

          {/* Fighter name */}
          {/* <InnerLink
            to="/fighters/$fighterSlug"
            params={{ fighterSlug: opponentSlug }}
            className="text-blue-500 font-medium"
          >
            {opponentName || "N/A"}
          </InnerLink> */}
        </div>

        <div className="text-right">
          {/* <div className="text-muted-foreground text-[11px]">{fight.weight_class || "N/A"}</div>
          <div className="text-[11px] whitespace-nowrap">
            {fight.result_method && `${fight.result_method} `}
            {fight.result_round && `R${fight.result_round}`}
          </div> */}
        </div>
      </div>

      {/* <LinkOverlay
        to="/events/$eventSlug/$fightId"
        params={{ eventSlug: fight.event_slug, fightId: fight.id }}
      /> */}
    </LinkBox>
  );
}

interface FighterHistoryProps {
  idOrSlug: string;
}

export function FighterHistory({ idOrSlug }: FighterHistoryProps) {
  // const {
  //   data: fights,
  //   isLoading,
  //   error,
  // } = useQuery();
  // if (isLoading) {
  //   return <SkeletonCard />;
  // }
  // if (error || !fights || fights.length === 0) {
  //   return null;
  // }
  // return (
  //   <Card>
  //     <CardHeader>
  //       <CardTitle className="flex items-center gap-2">
  //         <Trophy className="size-4" />
  //         Fight History ({fights.length} fights)
  //       </CardTitle>
  //     </CardHeader>
  //     <CardContent>
  //       <div className="divide-y text-xs">
  //         {/* {fights.map((fight) => (
  //           <FightRow key={fight.id} fight={fight} fighterId={fighterId} />
  //         ))} */}
  //       </div>
  //     </CardContent>
  //   </Card>
  // );
}
