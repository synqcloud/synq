"use client";
// Core
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

// Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/component";
import {
  Clock,
  Package,
  Boxes,
  Search,
  Zap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { MarketplaceIcon } from "./marketplace-icon";

// Utils
import { format } from "date-fns";
import { formatCurrency } from "@/shared/utils/format-currency";
import { getTransactionTypeColor, getTransactionTypeLabel } from "./utils";

// Services
import { TransactionService, UserTransaction } from "@synq/supabase/services";

export default function TransactionsTable({
  transactions,
}: {
  transactions: (UserTransaction & { totalQuantity: number })[];
}) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (transactionId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(transactionId)) {
      newExpandedRows.delete(transactionId);
    } else {
      newExpandedRows.add(transactionId);
    }
    setExpandedRows(newExpandedRows);
  };

  const displayTransactions = transactions;

  return (
    <div>
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-light w-[120px]">
                Type
              </TableHead>
              <TableHead className="text-xs font-light w-[140px]">
                Products
              </TableHead>
              <TableHead className="text-xs font-light w-[120px]">
                Source
              </TableHead>
              <TableHead className="text-xs font-light text-right w-[100px]">
                Net Amount
              </TableHead>
              <TableHead className="text-xs font-light text-right w-[80px]">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTransactions.map((tx, index) => (
              <TransactionRowGroup
                key={tx.id}
                transaction={tx}
                index={index}
                isExpanded={expandedRows.has(tx.id)}
                onToggle={() => toggleRow(tx.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Transaction row group component
function TransactionRowGroup({
  transaction: tx,
  index,
  isExpanded,
  onToggle,
}: {
  transaction: UserTransaction & { totalQuantity: number };
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      {/* Main Transaction Row */}
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        className={`group hover:bg-muted/30 transition-colors cursor-pointer border-b ${
          isExpanded
            ? "border-b-0 border-l-2 border-l-blue-500/70"
            : "last:border-0"
        } ${tx.is_integration && !isExpanded ? "bg-blue-50/20" : ""}`}
        onClick={onToggle}
      >
        {/* Type */}
        <TableCell className="py-4 pl-6 align-middle">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center mr-1"
            >
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            </motion.div>
            <div
              className={`w-2 h-2 rounded-full ${getTransactionTypeColor(tx.transaction_type)}`}
            />
            <span className="text-sm font-light">
              {getTransactionTypeLabel(tx.transaction_type)}
            </span>
            {tx.is_integration && (
              <div className="flex items-center">
                <Zap className="h-3 w-3 text-blue-500/70 ml-1" />
              </div>
            )}
          </div>
        </TableCell>

        {/* Products */}
        <TableCell className="py-4 align-middle">
          <div className="flex items-center gap-2">
            {tx.totalQuantity > 1 ? (
              <Boxes className="h-4 w-4 text-muted-foreground/60" />
            ) : (
              <Package className="h-4 w-4 text-muted-foreground/60" />
            )}
            <span className="font-light text-sm">
              {tx.totalQuantity ?? 0} item
              {tx.totalQuantity !== 1 ? "s" : ""}
            </span>
          </div>
        </TableCell>

        {/* Source */}
        <TableCell className="py-4 align-middle">
          <MarketplaceIcon
            marketplace={tx.source || "Manual"}
            isIntegration={tx.is_integration}
          />
        </TableCell>

        {/* Net Amount */}
        <TableCell className="text-right py-4 align-middle">
          <p
            className={`text-sm font-medium ${
              (tx.transaction_type === "BUY"
                ? -(tx.net_amount ?? 0)
                : (tx.net_amount ?? 0)) >= 0
                ? "text-emerald-600/90"
                : "text-red-500/90"
            }`}
          >
            {(tx.transaction_type === "BUY"
              ? -(tx.net_amount ?? 0)
              : (tx.net_amount ?? 0)) >= 0
              ? "+"
              : "-"}
            {formatCurrency(
              Math.abs(
                tx.transaction_type === "BUY"
                  ? -(tx.net_amount ?? 0)
                  : (tx.net_amount ?? 0),
              ),
            )}
          </p>
        </TableCell>

        {/* Date */}
        <TableCell className="text-right py-4 align-middle pr-6">
          <div className="flex items-center gap-2 justify-end">
            <Clock className="h-3 w-3 text-muted-foreground/60" />
            <span className="text-sm font-light text-muted-foreground/80">
              {format(new Date(tx.created_at), "MMM dd")}
            </span>
          </div>
        </TableCell>
      </motion.tr>

      {/* Child Rows for Transaction Items */}
      <AnimatePresence>
        {isExpanded && (
          <TransactionItemsRows
            transactionId={tx.id}
            isIntegration={tx.is_integration}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Transaction items child rows component
function TransactionItemsRows({
  transactionId,
  isIntegration,
}: {
  transactionId: string;
  isIntegration: boolean;
}) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["transactionItems", transactionId],
    queryFn: () =>
      TransactionService.fetchUserTransactionItems("client", transactionId),
    enabled: !!transactionId,
  });

  if (isLoading) {
    return (
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`border-b last:border-0 ${
          isIntegration
            ? "border-l-2 border-l-blue-500/70 bg-blue-50/10"
            : "bg-muted/10"
        }`}
      >
        <TableCell colSpan={5} className="py-4 text-center">
          <span className="text-sm text-muted-foreground">
            Loading items...
          </span>
        </TableCell>
      </motion.tr>
    );
  }

  if (items.length === 0) {
    return (
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`border-b last:border-0 ${
          isIntegration
            ? "border-l-2 border-l-blue-500/70 bg-blue-50/10"
            : "bg-muted/10"
        }`}
      >
        <TableCell colSpan={5} className="py-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Package className="h-6 w-6 text-muted-foreground/40" />
            <span className="text-sm font-light text-muted-foreground">
              No products found
            </span>
          </div>
        </TableCell>
      </motion.tr>
    );
  }

  return (
    <>
      {items.map((item, itemIndex) => (
        <motion.tr
          key={item.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2, delay: itemIndex * 0.03 }}
          className={`hover:bg-muted/20 transition-colors border-b last:border-0`}
        >
          <TableCell colSpan={5} className="py-3 px-6 align-middle">
            <div className="flex justify-between items-center w-full gap-4">
              {/* Left-side: Item info */}
              <div className="flex flex-wrap gap-4 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {item.card_name}
                </span>
                <span className="text-xs font-light text-muted-foreground">
                  Qty: {item.quantity}
                </span>
                <span className="text-xs font-light text-muted-foreground">
                  Unit: {formatCurrency(item.unit_price)}
                </span>
                <span className="text-xs font-light text-muted-foreground">
                  Total: {formatCurrency(item.quantity * item.unit_price)}
                </span>
              </div>

              {/* Right-side: Action button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/inventory/${item.core_card_id}`, "_blank");
                }}
                className="p-1.5 hover:bg-muted/40 rounded-md transition-colors shrink-0"
                title="Look up product"
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground/60" />
              </motion.button>
            </div>
          </TableCell>
        </motion.tr>
      ))}
    </>
  );
}
