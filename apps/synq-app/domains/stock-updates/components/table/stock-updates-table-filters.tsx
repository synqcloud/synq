/**
 * TODO: This files needs refactoring, filtering components must be moved to a separate file and make them reusable.
 */
"use client";

import { useState } from "react";
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Badge,
  Calendar,
} from "@synq/ui/component";
import { Calendar as CalendarIcon, X } from "lucide-react";

interface StockUpdatesFiltersProps {
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

export function StockUpdatesFilters({
  dateRange,
  onDateRangeChange,
}: StockUpdatesFiltersProps) {
  const [open, setOpen] = useState(false);
  const hasDateFilter = !!dateRange.start || !!dateRange.end;

  const clearAllFilters = () => onDateRangeChange({ start: null, end: null });

  return (
    <div className="flex items-center gap-2">
      {/* Active Filter Badge */}
      {hasDateFilter && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 px-2 py-1 text-xs h-6 truncate"
        >
          <CalendarIcon className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">
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
            onClick={clearAllFilters}
          />
        </Badge>
      )}

      {/* Filter Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2 text-sm">
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
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-3 border-b text-xs font-medium text-muted-foreground mb-2">
            Date Range
          </div>
          <Calendar
            mode="range"
            selected={{
              from: dateRange.start ?? undefined,
              to: dateRange.end ?? undefined,
            }}
            onSelect={(range) =>
              onDateRangeChange({
                start: range?.from ?? null,
                end: range?.to ?? null,
              })
            }
            numberOfMonths={2}
          />
          <div className="p-3 border-t flex justify-between">
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAllFilters}
              className="h-7 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
