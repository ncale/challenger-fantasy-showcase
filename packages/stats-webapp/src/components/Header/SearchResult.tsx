import type { SearchFightersReturn } from "@challenger-fantasy/types";
import { DefaultAvatar } from "../Avatars/DefaultAvatar";

export const SearchResult = ({ fighter }: { fighter: SearchFightersReturn[number] }) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Fighter Avatar */}
      <div className="flex-shrink-0">
        <DefaultAvatar text={fighter.full_name} size="sm" />
      </div>

      {/* Fighter Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{fighter.full_name}</div>
      </div>
    </div>
  );
};
