"use client";
// Core
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// Components
import {
  TransactionsFilters,
  TransactionsTable,
} from "@/domains/transactions/components";
import { Spinner } from "@synq/ui/component";
// Services
import { TransactionService, TransactionType } from "@synq/supabase/services";

function useCookieState<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setValue(JSON.parse(saved));
    } catch {
      // ignore JSON errors
    }
  }, [key]);

  const setValueAndSave = (newValue: T) => {
    setValue(newValue);
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch {
      // ignore storage errors
    }
  };

  return [value, setValueAndSave];
}

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useCookieState<TransactionType[]>(
    "transactionTypes",
    [],
  );
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const filters = useMemo(
    () => ({
      types: typeFilter.length ? typeFilter : undefined,
      startDate: dateRange.start || undefined,
      endDate: dateRange.end || undefined,
    }),
    [typeFilter, dateRange],
  );

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userTransactions", filters],
    queryFn: () => TransactionService.fetchUserTransactions("client", filters),
    staleTime: 60000,
  });

  useEffect(() => {
    document.title = "Transactions";
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Slim filter bar */}
      <div className="flex-shrink-0 p-2 border-b">
        <TransactionsFilters
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Table */}
      <div className="flex-1 p-4 overflow-auto min-h-0">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-500">
            Failed to load transactions.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <TransactionsTable transactions={transactions} />
          </div>
        )}
      </div>
    </div>
  );
}
