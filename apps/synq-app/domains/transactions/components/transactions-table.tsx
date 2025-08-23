"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Card,
  CardContent,
} from "@synq/ui/component";
import { Clock, MoreHorizontal, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/shared/utils/format-currency";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "framer-motion";
import { MarketplaceIcon } from "./marketplace-icon";

// Transaction type - updated to match comprehensive data model
export type TransactionType =
  | "SALE" // Selling cards to customers
  | "PURCHASE" // Buying cards for inventory
  | "TRADE_IN" // Customer trading in cards
  | "TRADE_OUT" // Trading cards to customers
  | "GRADING_SUBMIT" // Sending cards for grading
  | "GRADING_RETURN" // Cards returned from grading
  | "CONSIGNMENT_IN" // Taking cards on consignment
  | "CONSIGNMENT_OUT" // Selling consigned cards
  | "DAMAGE_LOSS" // Cards lost, stolen, or damaged
  | "RETURN_REFUND" // Customer returns/refunds
  | "ADJUSTMENT" // Manual inventory adjustments
  | "FEE_ONLY"; // Fee-only transactions

export type Transaction = {
  id: string; // UUID
  user_id: string; // UUID
  card_id?: string; // UUID - nullable for some transaction types
  card?: {
    name: string;
    set: string;
    setCode: string;
    rarity: string;
    imageUrl: string;
    foil: boolean;
  };
  quantity: number; // positive for acquisitions, negative for disposals
  unit_price: number; // price per card
  total_amount: number; // unit_price * quantity
  fees: number; // marketplace fees, shipping, grading, etc.
  net_amount: number; // total_amount - fees
  transaction_type: TransactionType;
  transaction_date: Date;
  status: "pending" | "completed" | "cancelled";

  // Business fields
  source?: string; // Customer name, store, grading company, etc.
  destination?: string; // Where card went (for sales, grading, etc.)
  condition?: string; // Card condition at time of transaction
  grading_info?: {
    service: string; // "PSA", "BGS", etc.
    grade?: string; // "9", "10", etc.
    submission_date?: Date;
    expected_return?: Date;
  };
  location?: string; // Storage location at time of transaction
  cogs?: number; // Cost of goods sold (for sales)
  profit?: number; // Auto-calculated: price - cogs
  notes?: string; // Free-form comments
  linked_invoice?: string; // Invoice number or reference
  sale_channel?: string; // "Shopify", "TCGPlayer", "In-store", etc.

  // Legacy fields for backwards compatibility
  marketplace?: string;
  collection?: string;
  note?: string;
};

interface TransactionsTableProps {
  transactions: Transaction[];
  limit?: number;
  showHeader?: boolean;
  showViewAll?: boolean;
  className?: string;
  variant?: "default" | "compact" | "full";
}

export default function TransactionsTable({
  transactions,
  limit,
  showHeader = true,
  showViewAll = false,
  className = "",
  variant = "default",
}: TransactionsTableProps) {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const displayTransactions = limit
    ? transactions.slice(0, limit)
    : transactions;

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsSheetOpen(true);
  };

  const getTransactionTypeLabel = (type: TransactionType): string => {
    const labels: Record<TransactionType, string> = {
      SALE: "Sale",
      PURCHASE: "Purchase",
      TRADE_IN: "Trade In",
      TRADE_OUT: "Trade Out",
      GRADING_SUBMIT: "Grading Submit",
      GRADING_RETURN: "Grading Return",
      CONSIGNMENT_IN: "Consignment In",
      CONSIGNMENT_OUT: "Consignment Out",
      DAMAGE_LOSS: "Damage/Loss",
      RETURN_REFUND: "Return/Refund",
      ADJUSTMENT: "Adjustment",
      FEE_ONLY: "Fee Only",
    };
    return labels[type];
  };

  const getTransactionTypeColor = (type: TransactionType): string => {
    // Pastel colors matching chart theme
    if (
      ["PURCHASE", "TRADE_IN", "GRADING_RETURN", "CONSIGNMENT_IN"].includes(
        type,
      )
    ) {
      return "bg-blue-200/60"; // Pastel blue for acquisitions
    }
    if (["SALE", "TRADE_OUT", "CONSIGNMENT_OUT"].includes(type)) {
      return "bg-emerald-200/60"; // Pastel green for disposals
    }
    if (["GRADING_SUBMIT"].includes(type)) {
      return "bg-purple-200/60"; // Pastel purple for grading
    }
    if (
      ["DAMAGE_LOSS", "RETURN_REFUND", "ADJUSTMENT", "FEE_ONLY"].includes(type)
    ) {
      return "bg-amber-200/60"; // Pastel yellow for adjustments
    }
    return "bg-slate-200/60"; // Default pastel gray
  };

  return (
    <>
      <div className={`border-b ${className}`}>
        {showHeader && (
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-light tracking-[-0.01em] text-foreground">
                  Transaction History
                </h2>
                <p className="text-sm font-light tracking-[-0.01em] text-muted-foreground mt-1">
                  Recent activity in your portfolio
                </p>
              </div>
              {showViewAll && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/transactions"
                    className="flex items-center gap-2 text-sm font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View all <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        )}

        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {variant === "default" && (
                  <TableHead className="w-12 h-14"></TableHead>
                )}
                <TableHead className="text-xs font-light tracking-[-0.01em]">
                  Type
                </TableHead>
                {variant !== "full" && (
                  <TableHead className="text-xs font-light tracking-[-0.01em]">
                    {variant === "compact" ? "Description" : "Card"}
                  </TableHead>
                )}
                {variant === "full" && (
                  <TableHead className="text-xs font-light tracking-[-0.01em]">
                    Description
                  </TableHead>
                )}
                {variant === "full" && (
                  <TableHead className="text-xs font-light tracking-[-0.01em]">
                    Source
                  </TableHead>
                )}
                {variant === "default" && (
                  <TableHead className="text-xs font-light tracking-[-0.01em]">
                    Quantity
                  </TableHead>
                )}
                {variant === "full" && (
                  <TableHead className="text-xs font-light tracking-[-0.01em] text-center">
                    Qty
                  </TableHead>
                )}
                <TableHead className="text-xs font-light tracking-[-0.01em]">
                  {variant === "compact"
                    ? "Source"
                    : variant === "full"
                      ? "Unit Price"
                      : "Unit Price"}
                </TableHead>
                {variant === "full" && (
                  <TableHead className="text-xs font-light tracking-[-0.01em] text-right">
                    Fees
                  </TableHead>
                )}
                <TableHead className="text-xs font-light tracking-[-0.01em] text-right">
                  {variant === "full" ? "Net Amount" : "Net Amount"}
                </TableHead>
                <TableHead className="text-xs font-light tracking-[-0.01em] text-right">
                  Date
                </TableHead>
                {(variant === "compact" || variant === "full") && (
                  <TableHead className="w-10"></TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="group hover:bg-muted/30 transition-colors cursor-pointer border-b last:border-0"
                  onClick={() => handleRowClick(transaction)}
                >
                  {variant === "default" && (
                    <TableCell className="py-4 pl-6">
                      <div className="w-8 h-11 bg-muted/30 rounded-md border overflow-hidden">
                        {transaction.card?.imageUrl ? (
                          <img
                            src={transaction.card.imageUrl}
                            alt={transaction.card.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/blur-card-placeholder.webp";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                            <span className="text-xs font-light tracking-[-0.01em] text-muted-foreground">
                              N/A
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* First column: Type for all variants */}
                  <TableCell className="py-4 pl-6 align-middle">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getTransactionTypeColor(transaction.transaction_type)}`}
                      />
                      <span className="text-sm font-light tracking-[-0.01em]">
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Description/Card column */}
                  {variant !== "full" && (
                    <TableCell className="py-4 align-middle">
                      {variant === "default" ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium tracking-[-0.01em]">
                            {transaction.card?.name ||
                              (transaction.transaction_type === "FEE_ONLY"
                                ? "Fee Payment"
                                : "Multiple Cards")}
                          </p>
                          {transaction.card && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80">
                                {transaction.condition || "Unknown"}
                              </span>
                              {transaction.card.foil && (
                                <Badge
                                  variant="outline"
                                  className="text-xs h-5 bg-blue-50/50 text-blue-600 border-blue-200/50 font-light tracking-[-0.01em]"
                                >
                                  Foil
                                </Badge>
                              )}
                            </div>
                          )}
                          {transaction.note && (
                            <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground/70 italic">
                              {transaction.note}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <span className="font-light tracking-[-0.01em]">
                            {transaction.card?.name ||
                              (transaction.transaction_type === "FEE_ONLY"
                                ? "Fee Payment"
                                : "Transaction")}
                          </span>
                        </div>
                      )}
                    </TableCell>
                  )}

                  {/* Description column for full variant */}
                  {variant === "full" && (
                    <TableCell className="py-4 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium tracking-[-0.01em]">
                          {transaction.card?.name ||
                            (transaction.transaction_type === "FEE_ONLY"
                              ? "Fee Payment"
                              : "Multiple Cards")}
                        </p>
                        {transaction.card && (
                          <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80">
                            {transaction.card.set} ({transaction.card.setCode})
                            {transaction.condition &&
                              ` • ${transaction.condition}`}
                            {transaction.card.foil && " • Foil"}
                          </p>
                        )}
                        {transaction.note && (
                          <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground/70 italic">
                            {transaction.note}
                          </p>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* Source column for full variant */}
                  {variant === "full" && (
                    <TableCell className="py-4 align-middle">
                      <MarketplaceIcon 
                        marketplace={transaction.sale_channel || transaction.source || transaction.marketplace || "Manual"} 
                      />
                    </TableCell>
                  )}

                  {/* Quantity column */}
                  {variant === "default" && (
                    <TableCell className="py-4 align-middle">
                      <div className="space-y-1">
                        <p className="text-sm font-medium tracking-[-0.01em]">
                          {Math.abs(transaction.quantity)}
                        </p>
                        <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground/70">
                          {transaction.quantity > 0 ? "acquired" : "sold"}
                        </p>
                      </div>
                    </TableCell>
                  )}

                  {variant === "full" && (
                    <TableCell className="text-center py-4 align-middle">
                      <div className="flex items-center justify-center">
                        <span
                          className={`text-sm font-medium tracking-[-0.01em] px-2 py-1 rounded-md ${
                            transaction.quantity > 0
                              ? "bg-blue-50/60 text-blue-700"
                              : "bg-red-50/60 text-red-700"
                          }`}
                        >
                          {transaction.quantity > 0 ? "+" : ""}
                          {transaction.quantity}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {/* Unit Price / Source column */}
                  <TableCell className="py-4 align-middle">
                    {variant === "default" || variant === "full" ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium tracking-[-0.01em]">
                          {formatCurrency(transaction.unit_price)}
                        </p>
                        <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground/70">
                          per{" "}
                          {transaction.transaction_type.includes("PACK")
                            ? "pack"
                            : "card"}
                        </p>
                      </div>
                    ) : (
                      <MarketplaceIcon 
                        marketplace={transaction.sale_channel || transaction.source || transaction.marketplace || "Manual"} 
                      />
                    )}
                  </TableCell>

                  {/* Fees column for full variant */}
                  {variant === "full" && (
                    <TableCell className="text-right py-4 align-middle">
                      {transaction.fees > 0 ? (
                        <span className="text-sm font-medium tracking-[-0.01em] text-red-500/80">
                          {formatCurrency(transaction.fees)}
                        </span>
                      ) : (
                        <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground/60">
                          —
                        </span>
                      )}
                    </TableCell>
                  )}

                  {/* Net Amount column */}
                  <TableCell className="text-right py-4 align-middle">
                    <div className="space-y-1">
                      <p
                        className={`text-sm font-medium tracking-[-0.01em] ${
                          transaction.net_amount >= 0
                            ? "text-emerald-600/90"
                            : "text-red-500/90"
                        }`}
                      >
                        {transaction.net_amount >= 0 ? "+" : ""}
                        {formatCurrency(transaction.net_amount)}
                      </p>
                      {variant === "default" && transaction.fees > 0 && (
                        <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground/70">
                          fees: {formatCurrency(transaction.fees)}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Date / Status column */}
                  <TableCell className="text-right py-4 align-middle pr-6">
                    {variant === "full" ? (
                      <span className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80">
                        {format(transaction.transaction_date, "MMM dd, yyyy")}
                      </span>
                    ) : variant === "default" ? (
                      <span className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80">
                        {formatDistanceToNow(transaction.transaction_date, {
                          addSuffix: true,
                        })}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 justify-end">
                        <Clock className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground/80">
                          {format(transaction.transaction_date, "MMM dd")}
                        </span>
                      </div>
                    )}
                  </TableCell>

                  {/* Actions column */}
                  {(variant === "compact" || variant === "full") && (
                    <TableCell className="py-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-muted/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground/60" />
                      </motion.button>
                    </TableCell>
                  )}
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Transaction Detail Sheet - Updated styling */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-96 border-l bg-background/95 backdrop-blur-md">
          {selectedTransaction && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl font-light tracking-[-0.01em] text-foreground">
                  Transaction Details
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-8">
                <div className="space-y-4">
                  <div className="border rounded-xl bg-muted/20 p-4">
                    <label className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80 uppercase">
                      Type
                    </label>
                    <p className="text-lg font-light tracking-[-0.01em] mt-2">
                      {getTransactionTypeLabel(
                        selectedTransaction.transaction_type,
                      )}
                    </p>
                  </div>

                  {selectedTransaction.card && (
                    <div className="border rounded-xl bg-muted/20 p-4">
                      <label className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80 uppercase">
                        Card
                      </label>
                      <p className="text-lg font-light tracking-[-0.01em] mt-2">
                        {selectedTransaction.card.name}
                      </p>
                      <p className="text-sm font-light tracking-[-0.01em] text-muted-foreground/80 mt-1">
                        {selectedTransaction.card.set} (
                        {selectedTransaction.card.setCode})
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-xl bg-muted/20 p-4">
                      <label className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80 uppercase">
                        Date
                      </label>
                      <p className="font-light tracking-[-0.01em] mt-2">
                        {format(selectedTransaction.transaction_date, "PPP")}
                      </p>
                    </div>
                    <div className="border rounded-xl bg-muted/20 p-4">
                      <label className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80 uppercase">
                        Quantity
                      </label>
                      <p className="font-light tracking-[-0.01em] mt-2">
                        {Math.abs(selectedTransaction.quantity)}
                      </p>
                    </div>
                    <div className="border rounded-xl bg-muted/20 p-4">
                      <label className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80 uppercase">
                        Unit Price
                      </label>
                      <p className="font-light tracking-[-0.01em] mt-2">
                        {formatCurrency(selectedTransaction.unit_price)}
                      </p>
                    </div>
                    <div className="border rounded-xl bg-muted/20 p-4">
                      <label className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80 uppercase">
                        Total
                      </label>
                      <p className="font-light tracking-[-0.01em] mt-2">
                        {formatCurrency(selectedTransaction.total_amount)}
                      </p>
                    </div>
                    {selectedTransaction.fees > 0 && (
                      <div className="border rounded-xl bg-muted/20 p-4">
                        <label className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80 uppercase">
                          Fees
                        </label>
                        <p className="font-light tracking-[-0.01em] mt-2">
                          {formatCurrency(selectedTransaction.fees)}
                        </p>
                      </div>
                    )}
                    {(selectedTransaction.source || selectedTransaction.sale_channel) && (
                      <div className="border rounded-xl bg-muted/20 p-4">
                        <label className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80 uppercase">
                          Source
                        </label>
                        <div className="mt-2">
                          <MarketplaceIcon 
                            marketplace={selectedTransaction.sale_channel || selectedTransaction.source || ""} 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-xl bg-muted/20 p-4">
                    <label className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80 uppercase">
                      Net Amount
                    </label>
                    <p
                      className={`text-2xl font-light tracking-[-0.01em] mt-2 ${
                        selectedTransaction.net_amount >= 0
                          ? "text-emerald-600/90"
                          : "text-red-500/90"
                      }`}
                    >
                      {selectedTransaction.net_amount >= 0 ? "+" : ""}
                      {formatCurrency(selectedTransaction.net_amount)}
                    </p>
                  </div>

                  {selectedTransaction.note && (
                    <div className="border rounded-xl bg-muted/20 p-4">
                      <label className="text-xs font-light tracking-[-0.01em] text-muted-foreground/80 uppercase">
                        Note
                      </label>
                      <p className="text-sm font-light tracking-[-0.01em] mt-2">
                        {selectedTransaction.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
