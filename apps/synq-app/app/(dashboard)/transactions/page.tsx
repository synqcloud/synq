"use client";
// Core
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
// Components
import { TransactionTable } from "@/features/transactions/components/table/transaction-table";
import { Button, HStack, Spinner } from "@synq/ui/component";
// Services
import { TransactionService } from "@synq/supabase/services";

export default function TransactionsPage() {
  useEffect(() => {
    document.title = "Transactions";
  }, []);

  // Fetch transactions without source filter
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    error,
  } = useQuery({
    queryKey: ["userTransactions"],
    queryFn: () => TransactionService.fetchUserTransactions("client"),
    staleTime: 60_000,
  });

  if (transactionsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
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
    <div className="p-4">
      <HStack align="center" justify="between" className="p-2">
        <div /> {/* Empty div to maintain layout */}
        <Button size="sm" variant="outline">
          Add record
        </Button>
      </HStack>
      <div className="h-full overflow-y-scroll md:p-4">
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}
