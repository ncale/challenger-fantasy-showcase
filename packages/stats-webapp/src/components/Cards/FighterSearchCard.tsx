import { kebab } from "@challenger-fantasy/core";
import type { SearchFightersReturn } from "@challenger-fantasy/types";
import { Link } from "@tanstack/react-router";
import { DefaultAvatar } from "../Avatars/DefaultAvatar";
import { Card, CardHeader, CardTitle } from "./Card";

export const FighterSearchCard = ({ fighter }: { fighter: SearchFightersReturn[number] }) => {
  return (
    <Link to="/fighters/$fighterSlug" params={{ fighterSlug: kebab(fighter.full_name) }}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="font-bold group-hover:text-focus-blue transition-colors">
                {fighter.full_name}
              </CardTitle>
            </div>

            {/* Fighter Avatar */}
            <div className="ml-4">
              <DefaultAvatar text={fighter.full_name} size="sm" />
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
};
