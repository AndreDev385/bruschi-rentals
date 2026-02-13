import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Neighborhood } from "@/types";

interface NeighborhoodGridProps {
  neighborhoods: Neighborhood[];
  selectedId?: string;
  onSelect: (neighborhood: Neighborhood) => void;
}

const NeighborhoodGrid: React.FC<NeighborhoodGridProps> = ({
  neighborhoods,
  selectedId,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNeighborhoods = useMemo(() => {
    if (!searchQuery.trim()) return neighborhoods;

    const query = searchQuery.toLowerCase();
    return neighborhoods.filter((n) => n.name.toLowerCase().includes(query));
  }, [neighborhoods, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search neighborhoods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full px-4 py-3 rounded-lg border bg-white",
            "border-soft-mid focus:border-primary focus:ring-2 focus:ring-primary/20",
            "text-sm text-obsidian placeholder:text-mocha/60",
            "transition-all duration-200",
          )}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha hover:text-obsidian transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filteredNeighborhoods.map((neighborhood) => {
          const isSelected = selectedId === neighborhood.id;

          return (
            <button
              key={neighborhood.id}
              type="button"
              onClick={() => onSelect(neighborhood)}
              className={cn(
                "px-3 py-2.5 rounded-lg transition-all text-center",
                "text-sm font-medium leading-tight",
                "bg-soft-light shadow-m",
                isSelected
                  ? "bg-primary text-white"
                  : "hover:bg-primary hover:text-white",
              )}
            >
              {neighborhood.name}
            </button>
          );
        })}
      </div>

      {filteredNeighborhoods.length === 0 && (
        <p className="text-center text-mocha text-sm py-4">
          No neighborhoods found matching &quot;{searchQuery}&quot;
        </p>
      )}
    </div>
  );
};

export { NeighborhoodGrid };
