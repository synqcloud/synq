"use client";
import { useEffect, useState } from "react";
import { Button, HStack, Input } from "@synq/ui/component";
import { X } from "lucide-react";
import { useDebounce } from "@/shared/hooks/use-debounce";

export type StockFilterType = "all" | "in-stock" | "out-of-stock";
export type GroupByType = "game" | "set" | "card";

const STORAGE_KEY_FILTER = "inventory-stock-filter";
const STORAGE_KEY_GROUPBY = "inventory-group-by";

export default function InventoryTableFilters({
  onChange,
  onGroupByChange,
  isLoading = false,
  onSearchChange,
}: {
  onChange: (v: StockFilterType) => void;
  onGroupByChange: (v: GroupByType) => void;
  isLoading?: boolean;
  onSearchChange?: (q: string) => void;
}) {
  const [selected, setSelected] = useState<StockFilterType | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByType>("game");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const isSearchActive = search.trim().length > 0;

  // Load saved filter and groupBy from localStorage on mount
  useEffect(() => {
    let mounted = false;
    if (!mounted) {
      const savedFilter = localStorage.getItem(
        STORAGE_KEY_FILTER,
      ) as StockFilterType | null;
      const savedGroupBy = localStorage.getItem(
        STORAGE_KEY_GROUPBY,
      ) as GroupByType | null;

      const initialFilter = savedFilter || "all";
      const initialGroupBy = savedGroupBy || "game";

      setSelected(initialFilter);
      setGroupBy(initialGroupBy);
      onChange(initialFilter);
      onGroupByChange(initialGroupBy);
      mounted = true;
    }
  }, [onChange, onGroupByChange]);

  // Emit debounced search
  useEffect(() => {
    onSearchChange?.(debouncedSearch.trim());
  }, [debouncedSearch, onSearchChange]);

  const handleFilterChange = (v: StockFilterType) => {
    if (isSearchActive) return;
    setSelected(v);
    localStorage.setItem(STORAGE_KEY_FILTER, v);
    onChange(v);
  };

  const handleGroupByChange = (v: GroupByType) => {
    if (isSearchActive) return;
    setGroupBy(v);
    localStorage.setItem(STORAGE_KEY_GROUPBY, v);
    onGroupByChange(v);
  };

  const clearSearch = () => {
    setSearch("");
  };

  const filterButtons: StockFilterType[] = ["all", "in-stock", "out-of-stock"];
  const groupByButtons: { value: GroupByType; label: string }[] = [
    { value: "game", label: "Game" },
    { value: "set", label: "Set" },
    { value: "card", label: "Card" },
  ];

  return (
    <div className="flex items-center gap-4 justify-between">
      {/* Left side: Group By */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Group by:
        </span>
        <HStack gap={1}>
          {groupByButtons.map((btn) => (
            <Button
              key={btn.value}
              onClick={() => handleGroupByChange(btn.value)}
              size="sm"
              disabled={isLoading || isSearchActive}
              className={
                groupBy === btn.value
                  ? "px-3 py-2 bg-primary text-primary-foreground rounded text-xs font-medium h-9"
                  : "px-3 py-2 bg-muted/30 rounded border border-border/50 text-xs text-muted-foreground font-light h-9"
              }
            >
              {btn.label}
            </Button>
          ))}
        </HStack>
      </div>

      {/* Right side: Search and Stock Filters */}
      <div className="flex items-center gap-2">
        <div className="w-80 max-w-[60%] relative">
          <Input
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
            className="pr-8"
          />
          {isSearchActive && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-sm hover:bg-muted"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <HStack gap={1}>
          {filterButtons.map((b) => (
            <Button
              key={b}
              onClick={() => handleFilterChange(b)}
              size="sm"
              disabled={isLoading || isSearchActive}
              className={
                selected === b
                  ? "px-3 py-2 bg-primary/10 rounded border border-primary/20 text-xs text-primary font-light h-9"
                  : "px-3 py-2 bg-muted/30 rounded border border-border/50 text-xs text-muted-foreground font-light h-9"
              }
            >
              {b === "all"
                ? "All"
                : b === "in-stock"
                  ? "In Stock"
                  : "Out of Stock"}
            </Button>
          ))}
        </HStack>
      </div>
    </div>
  );
}
