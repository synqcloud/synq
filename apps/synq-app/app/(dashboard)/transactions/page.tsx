"use client";

// Core
import { useEffect, useState } from "react";
import { motion, HTMLMotionProps, MotionProps } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

// UI
import {
  TransactionsFilters,
  TransactionsTable,
} from "@/domains/transactions/components";

// Services
import {
  TransactionService,
  UserTransaction,
  UserTransactionItem,
} from "@synq/supabase/services";

// Make a custom type that correctly extends HTMLMotionProps
type MotionDivProps = HTMLMotionProps<"div"> &
  MotionProps & {
    className?: string;
  };

// Create a typed motion.div component
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

// Animation variants - more subtle
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

// Extend transaction type for table
type ExtendedTransaction = UserTransaction & {
  totalQuantity: number;
  user_transaction_items?: UserTransactionItem[];
};

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch transactions with React Query
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery<ExtendedTransaction[]>({
    queryKey: ["userTransactions"],
    queryFn: () => TransactionService.fetchUserTransactions("client"),
  });

  useEffect(() => {
    document.title = "Transactions";
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Filters */}
      <MotionDiv
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex-shrink-0 p-6"
      >
        <TransactionsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
      </MotionDiv>

      {/* Table */}
      <div className="flex-1">
        <MotionDiv
          ref={null}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="p-6"
        >
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">
              Loading transactions...
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Failed to load transactions.
            </div>
          ) : (
            <TransactionsTable
              transactions={transactions}
              showHeader={false}
              showViewAll={false}
              className="h-full"
            />
          )}
        </MotionDiv>
      </div>
    </div>
  );
}
