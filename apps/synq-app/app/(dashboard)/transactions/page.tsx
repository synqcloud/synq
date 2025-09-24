"use client";
// Core
import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
// Components
import { TransactionTable } from "@/features/transactions/components/table/transaction-table";
import TransactionsSkeleton from "@/features/transactions/components/transactions-skeleton";
import { Spinner } from "@synq/ui/component";
// Services
import { TransactionService } from "@synq/supabase/services";

export default function TransactionsPage() {
  useEffect(() => {
    document.title = "Transactions";
  }, []);

  const PAGE_SIZE = 50;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["userTransactions", { pageSize: PAGE_SIZE }],
    queryFn: ({ pageParam = 0 }) =>
      TransactionService.fetchUserTransactionsPage("client", {
        offset: pageParam,
        limit: PAGE_SIZE,
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

  // TODO: Refactor empty placeholder
  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        Failed to load orders.
      </div>
    );
  }

  return (
    <>
      <div ref={scrollContainerRef} className="h-full overflow-y-scroll p-4 space-y-4">
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
      </div>
    </>
  );
}
