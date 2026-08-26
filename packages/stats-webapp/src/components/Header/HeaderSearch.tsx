import { kebab } from "@challenger-fantasy/core";
import type { SearchFightersReturn } from "@challenger-fantasy/types";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { dataClient } from "../../lib/data-client";
import { Spinner } from "../LoadingUI/Spinner";
import { SearchResult } from "./SearchResult";

export function HeaderSearch({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Search query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["header-search", query],
    queryFn: () => dataClient.searchFighters(query, { limit: 4 }),
    enabled: query.trim().length > 0 && isFocused,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close popup when pressing escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.trim().length > 0);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (query.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow clicking on results
    setTimeout(() => {
      setIsFocused(false);
      setIsOpen(false);
    }, 150);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && query.trim()) {
      navigate({ to: "/search", search: { q: query.trim() } });
      setIsOpen(false);
      setIsFocused(false);
      setQuery(""); // Clear the search bar
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (fighter: SearchFightersReturn[number]) => {
    if (fighter.full_name) {
      navigate({ to: `/fighters/${kebab(fighter.full_name)}` });
      setIsOpen(false);
      setIsFocused(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  const handleResultKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    fighter: SearchFightersReturn[number],
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleResultClick(fighter);
    }
  };

  const handleClearClick = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="size-4 text-muted-foreground" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-border rounded-lg leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-focus-blue focus:border-focus-blue text-sm"
          placeholder="Search fighters..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            onClick={handleClearClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            type="button"
          >
            <X className="size-4 text-muted-foreground hover:text-accent-foreground" />
          </button>
        )}
      </div>

      {/* Search Results Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <Spinner size="md" className="mx-auto mb-2" />
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {searchResults.map((fighter) =>
                fighter.full_name ? (
                  <button
                    key={fighter.fighter_id}
                    type="button"
                    onClick={() => handleResultClick(fighter)}
                    onKeyDown={(e) => handleResultKeyDown(e, fighter)}
                    className="w-full text-left p-3 border-b border-border last:border-b-0 hover:bg-accent cursor-pointer focus:outline-none focus:bg-accent"
                    tabIndex={0}
                  >
                    <SearchResult fighter={fighter} />
                  </button>
                ) : (
                  <div
                    key={fighter.fighter_id}
                    className="p-3 border-b border-border last:border-b-0 opacity-50 cursor-not-allowed"
                    aria-disabled="true"
                  >
                    <SearchResult fighter={fighter} />
                  </div>
                ),
              )}
            </div>
          ) : query.trim() ? (
            <div className="p-4 text-center text-muted-foreground">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
