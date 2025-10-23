"use client";
// Core
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
// Components
import { TransactionTable } from "@/features/transactions/components/table/transaction-table";
import TransactionsFilters from "@/features/transactions/components/transactions-filters";
import TransactionsSkeleton from "@/features/transactions/components/transactions-skeleton";
import {
  Spinner,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@synq/ui/component";
import { AlertCircle, ArrowRightLeft } from "lucide-react";
// Services
import {
  TransactionService,
  TransactionStatus,
  TransactionType,
} from "@synq/supabase/services";
import { InventoryService } from "@synq/supabase/services";

export default function TransactionsPage() {
  useEffect(() => {
    document.title = "Transactions";
  }, []);

  const PAGE_SIZE = 50;

  const [filters, setFilters] = useState<{
    statuses?: TransactionStatus[];
    types?: TransactionType[];
    sources?: string[];
    startDate?: Date;
    endDate?: Date;
  }>({});

  // Load available sources for the filter (unique marketplaces)
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  useEffect(() => {
    let mounted = true;
    Promise.all([
      TransactionService.fetchUserMarketplaces("client"),
      InventoryService.getAvailableMarketplaces("client"),
    ]).then(([userSources, allSources]) => {
      if (!mounted) return;
      const merged = Array.from(
        new Set([...(userSources || []), ...(allSources || [])]),
      ).sort();
      setAvailableSources(merged);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "userTransactions",
      {
        pageSize: PAGE_SIZE,
        statuses: filters.statuses ?? null,
        types: filters.types ?? null,
        sources:
          filters.sources && filters.sources.length > 0
            ? filters.sources
            : null,
        startDate: filters.startDate?.toISOString() ?? null,
        endDate: filters.endDate?.toISOString() ?? null,
      },
    ],
    queryFn: ({ pageParam = 0 }) =>
      TransactionService.fetchUserTransactionsPage("client", {
        offset: pageParam,
        limit: PAGE_SIZE,
        filters: {
          statuses: filters.statuses,
          types: filters.types,
          sources:
            filters.sources && filters.sources.length > 0
              ? filters.sources
              : undefined,
          integrationOnly: undefined,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((sum, page) => sum + page.length, 0);
      return lastPage.length < PAGE_SIZE ? undefined : totalLoaded;
    },
    staleTime: 60_000,
  });

  const transactions = useMemo(() => {
    const flat = data?.pages ? data.pages.flat() : [];
    const seen = new Set<string>();
    const unique = [] as typeof flat;
    for (const t of flat) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        unique.push(t);
      }
    }
    return unique;
  }, [data?.pages]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        });
      },
      {
        root: container,
        rootMargin: "200px",
        threshold: 0,
      },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <TransactionsSkeleton rows={PAGE_SIZE} />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle />
            </EmptyMedia>
            <EmptyTitle>Failed to load transactions</EmptyTitle>
            <EmptyDescription>
              An error occurred while loading your transactions. Please try
              again.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b bg-muted/30">
        <TransactionsFilters
          isLoading={isLoading}
          sources={availableSources}
          onChange={(next) => {
            setFilters({
              statuses: next.statuses,
              types: next.types,
              sources: next.sources,
              startDate: next.startDate,
              endDate: next.endDate,
            });
          }}
        />
      </div>
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-scroll p-4 space-y-4"
      >
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ArrowRightLeft />
                </EmptyMedia>
                <EmptyTitle>No transactions found</EmptyTitle>
                <EmptyDescription>
                  {Object.keys(filters).some(
                    (key) => filters[key as keyof typeof filters],
                  )
                    ? "Try adjusting your filters to see more results"
                    : "Start by creating your first transaction"}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <>
            <TransactionTable transactions={transactions} />
            <div ref={sentinelRef} />
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <Spinner />
              </div>
            )}
            {!hasNextPage && transactions.length > 0 && (
              <div className="text-center text-muted-foreground text-sm py-4">
                No more transactions
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
