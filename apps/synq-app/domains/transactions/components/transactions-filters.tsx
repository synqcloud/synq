"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import {
  Button,
  ToggleGroup,
  ToggleGroupItem,
  Calendar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Badge,
  Input,
} from "@synq/ui/component";
import { getTransactionTypeColor, getTransactionTypeLabel } from "./utils";
import { TransactionType } from "@synq/supabase/services";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface TransactionsFiltersProps {
  typeFilter: TransactionType[];
  onTypeFilterChange: (types: TransactionType[]) => void;
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const TRANSACTION_TYPES: TransactionType[] = [
  "BUY",
  "SELL",
  "STOCK_MOVEMENT",
  "MARKETPLACE_LISTING",
];

// Helper function to format type labels
const formatTypeLabel = (type: string) =>
  type
    .replace("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

export function TransactionsFilters({
  typeFilter,
  onTypeFilterChange,
  dateRange,
  onDateRangeChange,
  searchQuery,
  onSearchQueryChange,
}: TransactionsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    onSearchQueryChange(debouncedSearch);
  }, [debouncedSearch, onSearchQueryChange]);

  const hasActiveFilters =
    typeFilter.length > 0 || dateRange.start || dateRange.end || searchQuery;

  const clearAllFilters = () => {
    onTypeFilterChange([]);
    onDateRangeChange({ start: null, end: null });
    setLocalSearch("");
  };

  return (
    <div className="space-y-3">
      {/* Top Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type Filters */}
        <ToggleGroup
          type="multiple"
          value={typeFilter}
          onValueChange={onTypeFilterChange as (value: string[]) => void}
          className="flex gap-2 flex-wrap"
        >
          {TRANSACTION_TYPES.map((type) => (
            <ToggleGroupItem
              key={type}
              value={type}
              className="flex items-center gap-2 px-3 py-1 text-sm rounded-md border min-w-max"
            >
              <div
                className={`w-2 h-2 rounded-full ${getTransactionTypeColor(type)}`}
              />
              <span>{getTransactionTypeLabel(type)}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* Search Input */}
        <Input
          placeholder="Search by card or source..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-64 min-w-[200px]"
        />

        {/* Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 min-w-[150px]"
            >
              <CalendarIcon className="h-4 w-4" />
              {dateRange.start && dateRange.end
                ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                : "Select Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{
                from: dateRange.start ?? undefined,
                to: dateRange.end ?? undefined,
              }}
              onSelect={(range) => {
                onDateRangeChange({
                  start: range?.from ?? null,
                  end: range?.to ?? null,
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {typeFilter.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="flex items-center gap-2 px-2 py-1 text-sm"
            >
              <div
                className={`w-2 h-2 rounded-full ${getTransactionTypeColor(type)}`}
              />
              <span>{getTransactionTypeLabel(type)}</span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() =>
                  onTypeFilterChange(typeFilter.filter((t) => t !== type))
                }
              />
            </Badge>
          ))}

          {(dateRange.start || dateRange.end) && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-sm"
            >
              <CalendarIcon className="h-3 w-3" />
              {dateRange.start?.toLocaleDateString()} –{" "}
              {dateRange.end?.toLocaleDateString()}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onDateRangeChange({ start: null, end: null })}
              />
            </Badge>
          )}

          {searchQuery && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-sm"
            >
              🔍 {searchQuery}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive ml-1"
                onClick={() => setLocalSearch("")}
              />
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground ml-1"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
