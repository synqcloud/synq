/**
 * TODO: This files needs refactoring, filtering components must be moved to a separate file and make them reusable.
 */
"use client";
// Core
import { useState } from "react";
// Components
import {
  Button,
  Calendar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Checkbox,
} from "@synq/ui/component";
import {
  Calendar as CalendarIcon,
  X,
  ChevronDown,
  Plus,
  Filter,
} from "lucide-react";
// Utils
import { getTransactionTypeColor, getTransactionTypeLabel } from "./utils";
//Services
import { TransactionType } from "@synq/supabase/services";

interface TransactionsFiltersProps {
  typeFilter: TransactionType[];
  onTypeFilterChange: (types: TransactionType[]) => void;
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

const TRANSACTION_TYPES: TransactionType[] = ["ORDER", "SALE", "LISTING"];

// Available filter fields
const FILTER_FIELDS = [
  { key: "type", label: "Type", icon: Filter },
  { key: "date", label: "Date", icon: CalendarIcon },
] as const;

type FilterFieldKey = (typeof FILTER_FIELDS)[number]["key"];

export function TransactionsFilters({
  typeFilter,
  onTypeFilterChange,
  dateRange,
  onDateRangeChange,
}: TransactionsFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const hasActiveFilters =
    typeFilter.length > 0 || dateRange.start || dateRange.end;

  const clearAllFilters = () => {
    onTypeFilterChange([]);
    onDateRangeChange({ start: null, end: null });
  };

  const handleTypeToggle = (type: TransactionType) => {
    if (typeFilter.includes(type)) {
      onTypeFilterChange(typeFilter.filter((t) => t !== type));
    } else {
      onTypeFilterChange([...typeFilter, type]);
    }
  };

  const removeTypeFilter = (type: TransactionType) => {
    onTypeFilterChange(typeFilter.filter((t) => t !== type));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (typeFilter.length > 0) count += typeFilter.length;
    if (dateRange.start || dateRange.end) count += 1;
    return count;
  };

  const getAvailableFilters = (): FilterFieldKey[] => {
    const active: FilterFieldKey[] = [];
    if (typeFilter.length === 0) active.push("type");
    if (!dateRange.start && !dateRange.end) active.push("date");
    return active;
  };

  return (
    <div className="space-y-3">
      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Add Filter Dropdown */}
        {getAvailableFilters().length > 0 && (
          <DropdownMenu
            open={openDropdown === "add-filter"}
            onOpenChange={(open) => setOpenDropdown(open ? "add-filter" : null)}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-sm text-muted-foreground hover:text-foreground border-dashed border"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {getAvailableFilters().map((fieldKey) => {
                const field = FILTER_FIELDS.find((f) => f.key === fieldKey);
                if (!field) return null;

                return (
                  <DropdownMenuItem
                    key={fieldKey}
                    onClick={() => {
                      // Initialize the filter with a default value and then open its dropdown
                      if (fieldKey === "type") {
                        // Start with the first transaction type selected
                        onTypeFilterChange([TRANSACTION_TYPES[0]!]);
                        setTimeout(() => setOpenDropdown("type"), 100);
                      } else if (fieldKey === "date") {
                        // Initialize with today's date
                        const today = new Date();
                        onDateRangeChange({ start: today, end: null });
                        setTimeout(() => setOpenDropdown("date"), 100);
                      }
                      setOpenDropdown(null); // Close the add filter dropdown first
                    }}
                    className="flex items-center gap-2"
                  >
                    <field.icon className="h-4 w-4" />
                    <span>{field.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Type Filter */}
        {typeFilter.length > 0 && (
          <DropdownMenu
            open={openDropdown === "type"}
            onOpenChange={(open) => setOpenDropdown(open ? "type" : null)}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-sm justify-start min-w-0"
              >
                <Filter className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">
                  Type is{" "}
                  {typeFilter.length === 1
                    ? getTransactionTypeLabel(typeFilter[0]!)
                    : `${typeFilter.length} selected`}
                </span>
                <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Transaction Type
                </div>
                <div className="space-y-1">
                  {TRANSACTION_TYPES.map((type) => (
                    <div
                      key={type}
                      className="flex items-center gap-2 p-1 rounded hover:bg-accent cursor-pointer"
                      onClick={() => handleTypeToggle(type)}
                    >
                      <Checkbox
                        checked={typeFilter.includes(type)}
                        className="h-4 w-4"
                      />
                      <div
                        className={`w-2 h-2 rounded-full ${getTransactionTypeColor(type)} flex-shrink-0`}
                      />
                      <span className="text-sm">
                        {getTransactionTypeLabel(type)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      onTypeFilterChange([]);
                      setOpenDropdown(null);
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Date Filter */}
        {(dateRange.start || dateRange.end) && (
          <Popover
            open={openDropdown === "date"}
            onOpenChange={(open) => setOpenDropdown(open ? "date" : null)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-sm justify-start min-w-0"
              >
                <CalendarIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {dateRange.start && dateRange.end
                    ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                    : dateRange.start
                      ? `From ${dateRange.start.toLocaleDateString()}`
                      : dateRange.end
                        ? `Until ${dateRange.end.toLocaleDateString()}`
                        : "Date"}
                </span>
                <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 border-b">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Date Range
                </div>
              </div>
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
              <div className="p-3 border-t flex justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onDateRangeChange({ start: null, end: null });
                    setOpenDropdown(null);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  Clear
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Show filter count when multiple filters are active */}
        {getActiveFiltersCount() > 1 && (
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {getActiveFiltersCount()} filters
          </div>
        )}

        {/* Clear all button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Quick access filter badges (like Notion's inline filters) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {typeFilter.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-xs h-6"
            >
              <div
                className={`w-2 h-2 rounded-full ${getTransactionTypeColor(type)} flex-shrink-0`}
              />
              <span>{getTransactionTypeLabel(type)}</span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive ml-1"
                onClick={() => removeTypeFilter(type)}
              />
            </Badge>
          ))}

          {(dateRange.start || dateRange.end) && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-xs h-6"
            >
              <CalendarIcon className="h-3 w-3 flex-shrink-0" />
              <span>
                {dateRange.start && dateRange.end
                  ? `${dateRange.start.toLocaleDateString()} – ${dateRange.end.toLocaleDateString()}`
                  : dateRange.start
                    ? `From ${dateRange.start.toLocaleDateString()}`
                    : dateRange.end
                      ? `Until ${dateRange.end.toLocaleDateString()}`
                      : "Date"}
              </span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive ml-1"
                onClick={() => onDateRangeChange({ start: null, end: null })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
