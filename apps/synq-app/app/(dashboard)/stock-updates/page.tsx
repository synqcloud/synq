"use client";
// Core
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// Components
import { TransactionsFilters } from "@/domains/transactions/components";
import { StockTable } from "@/features/stock-updates/components/table/stock-update-table";
import { Spinner } from "@synq/ui/component";
// Services
import { StockService } from "@synq/supabase/services";

export default function StockUpdatesPage() {
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  const filters = useMemo(
    () => ({
      startDate: dateRange.start || undefined,
      endDate: dateRange.end || undefined,
    }),
    [dateRange],
  );

  useEffect(() => {
    document.title = "Stock Updates";
  }, []);

  const {
    data: stockUpdates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userStockUpdatesWithCard", filters],
    queryFn: () =>
      StockService.fetchUserStockUpdatesWithCard("client", filters),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        Failed to load stock updates.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Filters Row */}
      <div className="flex items-center justify-between p-2 border-b">
        <TransactionsFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Stock Updates Content */}
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {stockUpdates.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No stock updates yet.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <StockTable updates={stockUpdates} />
          </div>
        )}
      </div>
    </div>
  );
}
