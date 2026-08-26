import { LINKS } from "@challenger-fantasy/core";
import type { SearchFightersReturn } from "@challenger-fantasy/types";
import { Search as SearchIcon } from "lucide-react";
import { FighterSearchCard } from "@/components/Cards/FighterSearchCard";
import { Spinner } from "../LoadingUI/Spinner";
import { SummaryPill } from "../Pill/SummaryPill";

interface SearchResultsProps {
  query: string;
  results: SearchFightersReturn | undefined;
  isLoading: boolean;
  error: unknown;
  className?: string;
}

export function SearchResults({
  query,
  results,
  isLoading,
  error,
  className = "",
}: SearchResultsProps) {
  const hasResults = results && results.length > 0;

  if (isLoading) {
    return (
      <div className={`text-center py-12 rounded-lg shadow-sm border ${className}`}>
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-muted-foreground">Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 rounded-lg shadow-sm border ${className}`}>
        <SearchIcon className="size-12 text-error mx-auto mb-4" />
        <p className="text-error mb-2">Search failed</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An error occurred while searching"}
        </p>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className={`text-center py-12 rounded-lg shadow-sm border ${className}`}>
        <SearchIcon className="size-12 text-muted-foreground mx-auto mb-4" />
        <p className="mb-2">No results found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search terms.</p>
      </div>
    );
  }
  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Search Results for "{query}"</h2>

        <div className="space-y-8">
          {/* Fighters Results */}
          <div>
            <div className="grid gap-1">
              {results.map((fighter) => (
                <FighterSearchCard key={fighter.fighter_id} fighter={fighter} />
              ))}
            </div>

            <SummaryPill>{results.length} fighters found</SummaryPill>

            <p className="text-sm text-muted-foreground text-center mt-4">
              Can't find who you're looking for? Try adjusting your search or{" "}
              <a href={LINKS.CONTACT_EMAIL_LINK} className="text-link-blue hover:underline">
                contact us
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
