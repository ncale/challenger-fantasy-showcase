import type { Fighter } from "@challenger-fantasy/types";
import { User, Zap } from "lucide-react";

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  popularFighters?: Fighter[];
  className?: string;
}

export function SearchSuggestions({
  onSuggestionClick,
  popularFighters,
  className = "",
}: SearchSuggestionsProps) {
  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Zap className="size-5 mr-2 text-muted-foreground" />
          Common Searches
        </h2>
        <div className="space-y-3">
          {popularFighters?.map((fighter) => (
            <button
              key={fighter.id}
              onClick={() => onSuggestionClick(fighter.full_name ?? "")}
              className="block w-full text-left px-4 py-2 text-muted-foreground hover:bg-accent rounded-md transition-colors"
              type="button"
            >
              <span className="flex items-center">
                <User className="size-4 mr-2 text-muted-foreground" />
                {fighter.full_name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
