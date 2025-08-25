"use client";
// Core
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";

// Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@synq/ui/component";
import {
  Clock,
  MoreHorizontal,
  ChevronRight,
  Package,
  Boxes,
  Search,
} from "lucide-react";
import { MarketplaceIcon } from "./marketplace-icon";

// Utils
import { format } from "date-fns";
import { formatCurrency } from "@/shared/utils/format-currency";

// Services
import { TransactionService, UserTransaction } from "@synq/supabase/services";

interface TransactionsTableProps {
  transactions: (UserTransaction & { totalQuantity: number })[];
  limit?: number;
  showHeader?: boolean;
  showViewAll?: boolean;
  className?: string;
}

export default function TransactionsTable({
  transactions,
  limit,
  showHeader = true,
  showViewAll = false,
  className = "",
}: TransactionsTableProps) {
  const displayTransactions = limit
    ? transactions.slice(0, limit)
    : transactions;

  const getTransactionTypeLabel = (
    type: UserTransaction["transaction_type"],
  ) => {
    const labels: Record<UserTransaction["transaction_type"], string> = {
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

  const getTransactionTypeColor = (
    type: UserTransaction["transaction_type"],
  ) => {
    if (
      ["PURCHASE", "TRADE_IN", "GRADING_RETURN", "CONSIGNMENT_IN"].includes(
        type,
      )
    )
      return "bg-blue-200/60";
    if (["SALE", "TRADE_OUT", "CONSIGNMENT_OUT"].includes(type))
      return "bg-emerald-200/60";
    if (["GRADING_SUBMIT"].includes(type)) return "bg-purple-200/60";
    if (
      ["DAMAGE_LOSS", "RETURN_REFUND", "ADJUSTMENT", "FEE_ONLY"].includes(type)
    )
      return "bg-amber-200/60";
    return "bg-slate-200/60";
  };

  return (
    <div className={`border-b ${className}`}>
      {showHeader && (
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-foreground">
                Transaction History
              </h2>
              <p className="text-sm font-light text-muted-foreground mt-1">
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
                  className="flex items-center gap-2 text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
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
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTransactions.map((tx, index) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="group hover:bg-muted/30 transition-colors cursor-pointer border-b last:border-0"
              >
                {/* Type */}
                <TableCell className="py-4 pl-6 align-middle">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getTransactionTypeColor(tx.transaction_type)}`}
                    />
                    <span className="text-sm font-light">
                      {getTransactionTypeLabel(tx.transaction_type)}
                    </span>
                  </div>
                </TableCell>

                {/* Products */}
                <TableCell className="py-4 align-middle">
                  <Popover>
                    <PopoverTrigger asChild>
                      <motion.button className="flex items-center gap-2 text-left hover:bg-muted/30 rounded-lg px-2 py-1 transition-colors">
                        {tx.totalQuantity > 1 ? (
                          <Boxes className="h-4 w-4 text-muted-foreground/60" />
                        ) : (
                          <Package className="h-4 w-4 text-muted-foreground/60" />
                        )}
                        <span className="font-light">
                          {tx.totalQuantity ?? 0} item
                          {tx.totalQuantity !== 1 ? "s" : ""}
                        </span>
                      </motion.button>
                    </PopoverTrigger>

                    <PopoverContent className="w-96 p-0" align="start">
                      <TransactionItemsPopover transactionId={tx.id} />
                    </PopoverContent>
                  </Popover>
                </TableCell>

                {/* Source */}
                <TableCell className="py-4 align-middle">
                  <MarketplaceIcon marketplace={tx.source || "Manual"} />
                </TableCell>

                {/* Net Amount */}
                <TableCell className="text-right py-4 align-middle">
                  <p
                    className={`text-sm font-medium ${
                      (tx.net_amount ?? 0) >= 0
                        ? "text-emerald-600/90"
                        : "text-red-500/90"
                    }`}
                  >
                    {(tx.net_amount ?? 0) >= 0 ? "+" : ""}
                    {formatCurrency(tx.net_amount ?? 0)}
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

                {/* Actions */}
                <TableCell className="py-4">
                  <motion.button className="p-2 hover:bg-muted/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground/60" />
                  </motion.button>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Popup component for transaction items
function TransactionItemsPopover({ transactionId }: { transactionId: string }) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["transactionItems", transactionId],
    queryFn: () =>
      TransactionService.fetchUserTransactionItems("client", transactionId),
    enabled: !!transactionId,
  });

  if (isLoading)
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;

  if (items.length === 0)
    return (
      <div className="p-6 text-center">
        <Package className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm font-light text-muted-foreground">
          No products found
        </p>
      </div>
    );

  return (
    <div className="max-h-80 overflow-y-auto">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-3 border-b last:border-0 hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium text-foreground">
                {item.card_name}
              </h5>
              <div className="flex items-center gap-2 mt-1 text-xs font-light text-muted-foreground">
                <span>Qty: {item.quantity}</span>
                <span>• Sold at: {formatCurrency(item.unit_price)}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                window.open(`/inventory/${item.core_card_id}`, "_blank")
              }
              className="p-1.5 hover:bg-muted/40 rounded-md transition-colors"
              title="Look up product"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground/60" />
            </motion.button>
          </div>
        </div>
      ))}
    </div>
  );
}
