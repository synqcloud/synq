"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  HStack,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/component";
import { Calendar } from "@synq/ui/component";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import {
  TransactionStatus,
  TransactionType,
} from "@synq/supabase/services";

type Filters = {
  statuses?: TransactionStatus[];
  types?: TransactionType[];
  sources?: string[];
  startDate?: Date;
  endDate?: Date;
};

const STORAGE_KEY = "transactions-filters";

export default function TransactionsFilters({
  isLoading = false,
  onChange,
  sources = [],
}: {
  isLoading?: boolean;
  onChange: (filters: Filters) => void;
  sources?: string[];
}) {
  const [status, setStatus] = useState<TransactionStatus | "all">("all");
  const [type, setType] = useState<TransactionType | "all">("all");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>();
  const [source, setSource] = useState<string | "all">("all");

  // Load saved filters
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Filters & {
          status?: TransactionStatus | "all";
          type?: TransactionType | "all";
        };
        if (parsed.status) setStatus(parsed.status as TransactionStatus);
        if (parsed.type) setType(parsed.type as TransactionType);
        if (parsed.startDate || parsed.endDate) {
          const loaded = {
            from: parsed.startDate ? new Date(parsed.startDate) : undefined,
            to: parsed.endDate ? new Date(parsed.endDate) : undefined,
          } as DateRange;
          setDateRange(loaded);
          setPendingRange(loaded);
        }
        if (parsed.sources && parsed.sources.length > 0) {
          setSource(parsed.sources[0] as string);
        }
        // Emit on mount
        onChange({
          statuses: parsed.status && parsed.status !== "all" ? [parsed.status] : undefined,
          types: parsed.type && parsed.type !== "all" ? [parsed.type] : undefined,
          sources: parsed.sources && parsed.sources.length > 0 ? parsed.sources : undefined,
          startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
          endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
        });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist and emit changes
  const emit = (next: Partial<Filters> & { status?: TransactionStatus | "all"; type?: TransactionType | "all" }) => {
    const nextStatus = next.status ?? status;
    const nextType = next.type ?? type;
    const nextStart = next.startDate ?? dateRange?.from;
    const nextEnd = next.endDate ?? dateRange?.to;
    const nextSource = (Object.prototype.hasOwnProperty.call(next, "sources")
      ? next.sources
      : source === "all"
        ? undefined
        : [source]) as string[] | undefined;

    const payload: Filters = {
      statuses: nextStatus !== "all" ? [nextStatus as TransactionStatus] : undefined,
      types: nextType !== "all" ? [nextType as TransactionType] : undefined,
      sources: nextSource,
      startDate: nextStart,
      endDate: nextEnd,
    };

    onChange(payload);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          status: nextStatus,
          type: nextType,
          sources: nextSource ?? [],
          startDate: nextStart ?? null,
          endDate: nextEnd ?? null,
        }),
      );
    } catch {}
  };

  const prettyRange = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return "Date";
    const fmt = (d?: Date) =>
      d
        ? d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "";
    return dateRange?.to ? `${fmt(dateRange.from)} – ${fmt(dateRange.to)}` : fmt(dateRange.from);
  }, [dateRange]);

  return (
    <div className="flex items-center gap-3 justify-between">
      <HStack gap={3} className="flex-1">
        {/* Status */}
        <div className="w-44">
          <Select
            value={status}
            onValueChange={(v) => {
              const value = v as TransactionStatus | "all";
              setStatus(value);
              emit({ status: value });
            }}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div className="w-44">
          <Select
            value={type}
            onValueChange={(v) => {
              const value = v as TransactionType | "all";
              setType(value);
              emit({ type: value });
            }}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Source */}
        <div className="w-44">
          <Select
            value={source}
            onValueChange={(v) => {
              const value = v as string | "all";
              setSource(value);
              emit({ sources: value === "all" ? undefined : [value] });
            }}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent emptyPlaceholder="No sources">
              <SelectItem value="all">All sources</SelectItem>
              {sources.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range (last) */}
        <div className="relative">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setPendingRange(dateRange);
              setRangeOpen((v) => !v);
            }}
            disabled={isLoading}
          >
            <CalendarIcon className="h-4 w-4" />
            {prettyRange}
          </Button>
          {rangeOpen && (
            <div className="absolute z-10 mt-2 p-2 bg-background border rounded-md shadow-md">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={pendingRange}
                onSelect={(r) => {
                  setPendingRange(r);
                }}
              />
              <div className="flex items-center justify-end gap-2 p-2 pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPendingRange(undefined);
                    setDateRange(undefined);
                    emit({ startDate: undefined, endDate: undefined });
                    setRangeOpen(false);
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setDateRange(pendingRange);
                    emit({ startDate: pendingRange?.from, endDate: pendingRange?.to });
                    setRangeOpen(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </HStack>
    </div>
  );
}


