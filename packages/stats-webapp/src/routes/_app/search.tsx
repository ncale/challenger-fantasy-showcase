import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { SearchBar } from "@/components/Search/SearchBar";
import { SearchResults } from "@/components/Search/SearchResults";
import { SearchSuggestions } from "@/components/Search/SearchSuggestions";
import { dataClient } from "@/lib/data-client";

const searchSchema = z.object({
  q: z.string().optional().default(""),
}) satisfies z.ZodType<{ q: string }>;

export const Route = createFileRoute("/_app/search")({
  component: SearchPage,
  validateSearch: searchSchema,
  staticData: { breadcrumb: "Search" },
});

function SearchPage() {
  const { q: urlQuery } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [inputValue, setInputValue] = useState(urlQuery);

  // Memoized active query - only changes when URL query changes
  const activeQuery = useMemo(() => urlQuery.trim(), [urlQuery]);

  // Keep input value in sync with URL changes (back/forward navigation, bookmarks, etc.)
  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  // Get popular fighters for suggestions
  const { data: popularFighters } = useQuery({
    queryKey: ["popular-fighters"],
    queryFn: () => dataClient.getPopularFighters({ limit: 5 }),
    enabled: activeQuery.length === 0,
  });

  // Search results
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
  } = useQuery({
    queryKey: ["search-fighters", activeQuery],
    queryFn: () => dataClient.searchFighters(activeQuery),
    enabled: activeQuery.length > 0,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  const hasSearchQuery = activeQuery.length > 0;

  const handleSearch = () => {
    const trimmedQuery = inputValue.trim();
    if (trimmedQuery) {
      navigate({ search: { q: trimmedQuery } });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    navigate({ search: { q: suggestion } });
  };

  return (
    <div className="page-container">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="flex gap-3">
          <SearchBar
            query={inputValue}
            onQueryChange={setInputValue}
            onKeyDown={handleKeyDown}
            placeholder="Search for fighters..."
            className="flex-1"
          />
          <button
            onClick={handleSearch}
            disabled={!inputValue.trim()}
            className="px-6 py-4 cursor-pointer bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            Search
          </button>
        </div>
      </div>

      {/* Search Results or Default Content */}
      {hasSearchQuery ? (
        <SearchResults
          query={activeQuery}
          results={searchResults}
          isLoading={isSearching}
          error={searchError}
        />
      ) : (
        <SearchSuggestions
          onSuggestionClick={handleSuggestionClick}
          popularFighters={popularFighters}
        />
      )}
    </div>
  );
}
