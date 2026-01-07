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
  Badge,
} from "@synq/ui/component";

import { X, SearchIcon, Package } from "lucide-react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { MarketplaceIcon } from "@/shared/icons/marketplace-icon";
import { cn } from "@synq/ui/utils";

export type StockFilterType = "all" | "in-stock" | "out-of-stock";
export type GroupByType = "game" | "set" | "card";
export type MarketplaceFilterType = "all" | "not-listed" | string;

const STORAGE_KEY_FILTER = "inventory-stock-filter";
const STORAGE_KEY_GROUPBY = "inventory-group-by";
const STORAGE_KEY_MARKETPLACE = "inventory-marketplace-filter";

// Define available marketplaces
const AVAILABLE_MARKETPLACES = [
  "TCGPlayer",
  "eBay",
  "Shopify",
  "Cardmarket",
  "in-store",
];

export default function InventoryTableFilters({
  onChangeAction,
  onGroupByChangeAction,
  onMarketplaceFilterChange,
  isLoading = false,
  onSearchChange,
  marketplaceCounts,
}: {
  onChangeAction: (v: StockFilterType) => void;
  onGroupByChangeAction: (v: GroupByType) => void;
  onMarketplaceFilterChange?: (v: MarketplaceFilterType) => void;
  isLoading?: boolean;
  onSearchChange?: (q: string) => void;
  marketplaceCounts?: Record<string, number> & {
    notListed?: number;
  };
}) {
  const [selected, setSelected] = useState<StockFilterType>("all");
  const [groupBy, setGroupBy] = useState<GroupByType>("game");
  const [marketplaceFilter, setMarketplaceFilter] =
    useState<MarketplaceFilterType>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const isSearchActive = search.trim().length > 0;

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedFilter = localStorage.getItem(
      STORAGE_KEY_FILTER,
    ) as StockFilterType | null;
    const savedGroupBy = localStorage.getItem(
      STORAGE_KEY_GROUPBY,
    ) as GroupByType | null;
    const savedMarketplace = localStorage.getItem(
      STORAGE_KEY_MARKETPLACE,
    ) as MarketplaceFilterType | null;

    const initialFilter = savedFilter || "all";
    const initialGroupBy = savedGroupBy || "game";
    const initialMarketplace = savedMarketplace || "all";

    setSelected(initialFilter);
    setGroupBy(initialGroupBy);
    setMarketplaceFilter(initialMarketplace);
    onChangeAction(initialFilter);
    onGroupByChangeAction(initialGroupBy);
    onMarketplaceFilterChange?.(initialMarketplace);
  }, [onChangeAction, onGroupByChangeAction, onMarketplaceFilterChange]);

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

  const handleMarketplaceFilterChange = (v: MarketplaceFilterType) => {
    // Allow marketplace filter changes even during search
    setMarketplaceFilter(v);
    localStorage.setItem(STORAGE_KEY_MARKETPLACE, v);
    onMarketplaceFilterChange?.(v);
  };

  const clearSearch = () => {
    setSearch("");
  };

  const groupByButtons: { value: GroupByType; label: string }[] = [
    { value: "game", label: "Game" },
    { value: "set", label: "Set" },
    { value: "card", label: "Card" },
  ];

  const stockFilterButtons: StockFilterType[] = [
    "all",
    "in-stock",
    "out-of-stock",
  ];

  return (
    <div className="space-y-3">
      {/* Primary Row: Marketplace Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Show cards listed on:
        </span>

        <HStack gap={2} align="center" wrap="wrap">
          {/* All Button */}
          <button
            onClick={() => handleMarketplaceFilterChange("all")}
            disabled={isLoading}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              "border hover:border-primary/50",
              marketplaceFilter === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/30 text-muted-foreground border-border",
              isLoading && "opacity-50 cursor-not-allowed",
            )}
          >
            All
          </button>

          {/* Not Listed Button */}
          <button
            onClick={() => handleMarketplaceFilterChange("not-listed")}
            disabled={isLoading}
            className={cn(
              "px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all",
              "border hover:border-primary/50",
              marketplaceFilter === "not-listed"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/30 text-muted-foreground border-border",
              isLoading && "opacity-50 cursor-not-allowed",
            )}
          >
            <Package className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Not Listed</span>
            {marketplaceCounts?.notListed !== undefined &&
              marketplaceCounts.notListed > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-1 px-1.5 py-0 text-xs h-4",
                    marketplaceFilter === "not-listed" &&
                      "bg-primary-foreground/20 text-primary-foreground",
                  )}
                >
                  {marketplaceCounts.notListed}
                </Badge>
              )}
          </button>

          {/* Marketplace Icons */}
          {AVAILABLE_MARKETPLACES.map((marketplace) => {
            const isActive = marketplaceFilter === marketplace;
            const count = marketplaceCounts?.[marketplace];

            return (
              <button
                key={marketplace}
                onClick={() => handleMarketplaceFilterChange(marketplace)}
                disabled={isLoading}
                className={cn(
                  "relative px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all",
                  "border hover:border-primary/50",
                  isActive
                    ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
                    : "bg-muted/30 border-border hover:bg-muted/50",
                  isLoading && "opacity-50 cursor-not-allowed",
                )}
              >
                <MarketplaceIcon
                  marketplace={marketplace}
                  showTooltip={false}
                  className="opacity-90"
                />
                {count !== undefined && count > 0 && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "px-1.5 py-0 text-xs h-4",
                      isActive &&
                        "bg-primary/20 text-primary border-primary/30",
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </HStack>
      </div>

      {/* Secondary Row: Group By + Stock Filter + Search */}
      <HStack gap={4} justify="between" align="center">
        {/* Left side: Group By + Stock Filter */}
        <HStack gap={4} align="center">
          {/* Group By */}
          <HStack gap={2} align="center">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Group by:
            </span>
            <ButtonGroup>
              {groupByButtons.map((btn) => (
                <Button
                  key={btn.value}
                  onClick={() => handleGroupByChange(btn.value)}
                  size="sm"
                  disabled={isLoading || isSearchActive}
                  variant={groupBy === btn.value ? "default" : "outline"}
                >
                  {btn.label}
                </Button>
              ))}
            </ButtonGroup>
          </HStack>

          {/* Stock Filter */}
          <ButtonGroup>
            {stockFilterButtons.map((filter) => (
              <Button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                variant={selected === filter ? "default" : "outline"}
                size="sm"
                disabled={isLoading || isSearchActive}
              >
                {filter === "all"
                  ? "All"
                  : filter === "in-stock"
                    ? "In Stock"
                    : "Out of Stock"}
              </Button>
            ))}
          </ButtonGroup>
        </HStack>

        {/* Right side: Search */}
        <InputGroup className="max-w-xs">
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
      </HStack>
    </div>
  );
}
