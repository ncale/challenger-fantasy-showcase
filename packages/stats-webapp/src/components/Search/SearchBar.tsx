import { Search as SearchIcon } from "lucide-react";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  query,
  onQueryChange,
  onKeyDown,
  placeholder = "Search for fighters, events, or fights...",
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="size-5 text-muted-foreground" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-4 border border-border rounded-lg leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:placeholder-muted-foreground focus:ring-1 focus:ring-focus-blue focus:border-focus-blue text-lg"
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
