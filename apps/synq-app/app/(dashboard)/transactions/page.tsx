"use client";
// Core
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
// Components
import { TransactionTable } from "@/features/transactions/components/table/transaction-table";
import {  Spinner } from "@synq/ui/component";
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
    <>
      <div className="h-full overflow-y-scroll p-4">
        <TransactionTable transactions={transactions} />
      </div>
    </>
  );
}
