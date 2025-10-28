"use client";
import { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  HStack,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Spinner,
} from "@synq/ui/component";

import { X, SearchIcon } from "lucide-react";
import { useDebounce } from "@/shared/hooks/use-debounce";

export type StockFilterType = "all" | "in-stock" | "out-of-stock";
export type GroupByType = "game" | "set" | "card";

const STORAGE_KEY_FILTER = "inventory-stock-filter";
const STORAGE_KEY_GROUPBY = "inventory-group-by";

export default function InventoryTableFilters({
  onChangeAction,
  onGroupByChangeAction,
  isLoading = false,
  onSearchChange,
}: {
  onChangeAction: (v: StockFilterType) => void;
  onGroupByChangeAction: (v: GroupByType) => void;
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
      onChangeAction(initialFilter);
      onGroupByChangeAction(initialGroupBy);
      mounted = true;
    }
  }, [onChangeAction, onGroupByChangeAction]);

  // Emit debounced search
  useEffect(() => {
    onSearchChange?.(debouncedSearch.trim());
  }, [debouncedSearch, onSearchChange]);

  const handleFilterChange = (v: StockFilterType) => {
    if (isSearchActive) return;
    setSelected(v);
    localStorage.setItem(STORAGE_KEY_FILTER, v);
    onChangeAction(v);
  };

  const handleGroupByChange = (v: GroupByType) => {
    if (isSearchActive) return;
    setGroupBy(v);
    localStorage.setItem(STORAGE_KEY_GROUPBY, v);
    onGroupByChangeAction(v);
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
    <HStack gap={4} justify="between" align="center">
      {/* Left side: Group By */}
      <HStack gap={2} align="center">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Group by:
        </span>
        <HStack gap={1}>
          <ButtonGroup>
            {groupByButtons.map((btn) => (
              <Button
                key={btn.value}
                onClick={() => handleGroupByChange(btn.value)}
                size="sm"
                disabled={isLoading || isSearchActive}
                className={
                  groupBy === btn.value
                    ? "bg-primary text-primary-foreground rounded font-medium"
                    : "bg-muted/30 rounded border border-border/50 text-muted-foreground font-light"
                }
              >
                {btn.label}
              </Button>
            ))}
          </ButtonGroup>
        </HStack>
      </HStack>

      {/* Right side: Search and Stock Filters */}
      <HStack gap={2} align="center">
        <InputGroup>
          <InputGroupInput
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
          />
          <InputGroupAddon align="inline-end">
            {isLoading ? (
              <Spinner />
            ) : isSearchActive ? (
              <Button
                onClick={clearSearch}
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4"
              >
                <X />
              </Button>
            ) : (
              <SearchIcon className="text-muted-foreground" />
            )}
          </InputGroupAddon>
        </InputGroup>
        <ButtonGroup>
          {filterButtons.map((b) => (
            <Button
              key={b}
              onClick={() => handleFilterChange(b)}
              variant={selected === b ? "default" : "outline"}
              size="sm"
              disabled={isLoading || isSearchActive}
            >
              {b === "all"
                ? "All"
                : b === "in-stock"
                  ? "In Stock"
                  : "Out of Stock"}
            </Button>
          ))}
        </ButtonGroup>
      </HStack>
    </HStack>
  );
}
