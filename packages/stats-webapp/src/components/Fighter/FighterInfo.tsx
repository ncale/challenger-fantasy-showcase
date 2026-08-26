import { calculateApeIndex, getAge } from "@challenger-fantasy/core";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Shield, User } from "lucide-react";
import { singleFighterQuery } from "@/lib/init-queries";
import { Card, CardContent, CardHeader, CardTitle } from "../Cards/Card";

interface FighterInfoCardProps {
  idOrSlug: string;
}

export function FighterInfoCard({ idOrSlug }: FighterInfoCardProps) {
  const { data: fighter, isLoading, error } = useQuery(singleFighterQuery(idOrSlug));

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error || !fighter) {
    return <div>Error loading fighter information.</div>;
  }

  const { allFormatted } = calculateApeIndex(fighter.heightIn, fighter.reachIn);

  return (
    <Card>
      <CardHeader>
        <CardTitle kind="upper" className="flex items-center gap-x-2">
          <User className="size-3.5" />
          Fighter Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {fighter.dob && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Age</span>
            <span className="font-medium flex items-center gap-1">
              <Calendar className="size-3.5" />
              {getAge(fighter.dob)} years
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Height/Reach</span>
          <span className="font-medium">{allFormatted}</span>
        </div>
        {/* TODO: this needs to be fetched somewhere else - should probably be calculated from our available data */}
        {/* {fighter.weight_lbs && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Weight</span>
            <span className="font-medium">{fighter.weight_lbs} lbs</span>
          </div>
        )} */}
        {fighter.stance && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stance</span>
            <span className="font-medium flex items-center gap-1">
              <Shield className="size-3.5" />
              {fighter.stance}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
