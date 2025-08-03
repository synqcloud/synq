"use client";

import { useState, useRef, useEffect } from "react";
import { motion, HTMLMotionProps, MotionProps } from "framer-motion";
import {
  TransactionsFilters,
  TransactionsTable,
} from "@/domains/transactions/components";
import { mockTransactions } from "@/domains/transactions/data/mock-transactions";

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
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const sectionRef = useRef(null);

  useEffect(() => {
    document.title = "Transactions";
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Fixed Filters Section */}
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

      {/* Table Content */}
      <div className="flex-1">
        <MotionDiv
          ref={sectionRef}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="p-6"
        >
          <TransactionsTable
            transactions={mockTransactions}
            showHeader={false}
            showViewAll={false}
            variant="full"
            className="h-full"
          />
        </MotionDiv>
      </div>
    </div>
  );
}
