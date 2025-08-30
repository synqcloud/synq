"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TransactionsFilters,
  TransactionsTable,
} from "@/domains/transactions/components";
import { TransactionService, TransactionType } from "@synq/supabase/services";

// Simple hook for cookie persistence
function useCookieState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setValue(JSON.parse(saved));
        } catch {
          // Ignore invalid JSON
        }
      }
      setIsHydrated(true);
    }
  }, [key]);

  const setValueAndSave = (newValue: T) => {
    setValue(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(newValue));
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
  }>({
    start: null,
    end: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Track hydration
  useEffect(() => {
    setIsHydrated(true);
    document.title = "Transactions";
  }, []);

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "userTransactions",
      typeFilter,
      dateRange.start?.toISOString(),
      dateRange.end?.toISOString(),
      searchQuery,
    ],
    queryFn: () =>
      TransactionService.fetchUserTransactions("client", {
        types: typeFilter.length ? typeFilter : undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
        searchQuery: searchQuery || undefined,
      }),
    enabled: isHydrated,
    staleTime: 30000, // 30 seconds
  });

  if (!isHydrated || isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Failed to load transactions.</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-shrink-0 p-6 border-b">
        <TransactionsFilters
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>

      <div className="flex-1 p-6">
        <TransactionsTable transactions={transactions} />
      </div>
    </div>
  );
}
