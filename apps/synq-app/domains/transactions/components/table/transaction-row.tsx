// Core
import { useState } from "react";
import { format } from "date-fns";
// Components
import { TableCell, TableRow } from "@synq/ui/component";
import { Clock, Package, Boxes, Zap, ChevronRight } from "lucide-react";
import { TransactionItemsRows } from "./product-row";
import { MarketplaceIcon } from "../marketplace-icon";
// Utils
import { formatCurrency } from "@/shared/utils/format-currency";
import { getTransactionTypeColor, getTransactionTypeLabel } from "./utils";
import { cn } from "@synq/ui/utils";
// Services
import { UserTransaction } from "@synq/supabase/services";

export function TransactionRowGroup({
  transaction: tx,
}: {
  transaction: UserTransaction & { total_quantity: number };
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Main Transaction Row */}
      <TableRow
        className={cn(
          "group hover:bg-muted/30 transition-colors cursor-pointer border-b",
          expanded
            ? "border-b-0 border-l-2 border-l-blue-500/70"
            : "last:border-0",
          tx.is_integration && !expanded && "bg-primary/10",
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Type */}
        <TableCell className="py-4 px-4 align-middle">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center flex-shrink-0">
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
                  expanded && "rotate-90",
                )}
              />
            </div>
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${getTransactionTypeColor(tx.transaction_type)}`}
            />
            <span className="text-sm font-light truncate">
              {getTransactionTypeLabel(tx.transaction_type)}
            </span>
            {tx.is_integration && (
              <div className="flex items-center flex-shrink-0">
                <Zap className="h-3 w-3 text-blue-500/70 ml-1" />
              </div>
            )}
          </div>
        </TableCell>

        {/* Products */}
        <TableCell className="py-4 px-4 align-middle">
          <div className="flex items-center gap-2 min-w-0">
            {tx.total_quantity > 1 ? (
              <Boxes className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
            ) : (
              <Package className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
            )}
            <span className="font-light text-sm truncate">
              {tx.total_quantity ?? 0} item
              {tx.total_quantity !== 1 ? "s" : ""}
            </span>
          </div>
        </TableCell>

        {/* Source */}
        <TableCell className="py-4 px-4 align-middle">
          <div className="min-w-0">
            <MarketplaceIcon
              marketplace={tx.source || "Manual"}
              isIntegration={tx.is_integration}
            />
          </div>
        </TableCell>

        {/* Net Amount */}
        <TableCell className="py-4 px-4 align-middle text-right">
          <p
            className="text-sm font-medium"
            style={{ color: "hsl(var(--chart-3))" }}
          >
            {formatCurrency(tx.net_amount ?? 0)}
          </p>
        </TableCell>

        {/* Date */}
        <TableCell className="py-4 px-4 align-middle text-right">
          <div className="flex items-center gap-2 justify-end min-w-0">
            <Clock className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
            <span className="text-sm font-light text-muted-foreground/80 truncate">
              {format(new Date(tx.created_at), "MMM dd")}
            </span>
          </div>
        </TableCell>
      </TableRow>

      {/* Child Rows for Transaction Items */}
      {expanded && (
        <TransactionItemsRows
          transactionId={tx.id}
          isIntegration={tx.is_integration}
        />
      )}
    </>
  );
}
