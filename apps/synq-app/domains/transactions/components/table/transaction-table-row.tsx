// Core
import { useState } from "react";
import { format } from "date-fns";
// Components
import { HStack, TableCell, TableRow } from "@synq/ui/component";
import { Clock, Package } from "lucide-react";
import { TransactionTableSheet } from "./transaction-table-sheet";
import { MarketplaceIcon } from "@/shared/icons/marketplace-icon";

// Utils
import { formatCurrency } from "@/shared/utils/format-currency";
import { cn } from "@synq/ui/utils";

// Services
import { UserTransaction } from "@synq/supabase/services";
import { useCurrency } from "@/shared/contexts/currency-context";

export function TransactionTableRow({
  order,
}: {
  order: UserTransaction & { total_quantity: number };
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  // Inline functions for order status styling and labels
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-200";
      case "IN_PROGRESS":
        return "bg-blue-200";
      case "COMPLETED":
        return "bg-emerald-200";
      default:
        return "bg-slate-200";
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "IN_PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      default:
        return status;
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent triggering if clicking on the more actions button or other interactive elements
    if ((e.target as HTMLElement).closest("button")) return;
    setSheetOpen(true);
  };

  const { currency } = useCurrency();
  return (
    <>
      <TableRow
        className={cn(
          "group hover:bg-muted/30 transition-colors cursor-pointer border-b last:border-0",
          order.is_integration && "bg-primary/10",
        )}
        onClick={handleRowClick}
      >
        {/* Type */}
        <TableCell>
          <HStack align="center" gap={2}>
            <div
              className={`w-2 h-2 rounded-full ${getOrderStatusColor("sale")}`}
            />
            <span className="text-sm font-light truncate">
              {getOrderStatusLabel(order.transaction_type)}
            </span>
          </HStack>
        </TableCell>

        {/* Status */}
        <TableCell>
          <HStack align="center" gap={2}>
            <div
              className={`w-2 h-2 rounded-full ${getOrderStatusColor(order.transaction_status)}`}
            />
            <span className="text-sm font-light truncate">
              {getOrderStatusLabel(order.transaction_status)}
            </span>
          </HStack>
        </TableCell>

        {/* Source / Channel */}
        <TableCell>
          <MarketplaceIcon
            marketplace={order.source || "Manual"}
            isIntegration={order.is_integration}
            showLabel={true}
          />
        </TableCell>

        {/* Number of Items */}
        <TableCell>
          <HStack align="center" gap={2}>
            <Package className="h-3 w-3" />
            <span className="font-light text-sm truncate">
              {order.total_quantity ?? 0} item
              {order.total_quantity !== 1 ? "s" : ""}
            </span>
          </HStack>
        </TableCell>

        {/* Subtotal Amount */}
        {/*<TableCell>
          <p
            className="text-sm font-medium"
            style={{ color: "hsl(var(--chart-3))" }}
          >
            {formatCurrency(order.subtotal_amount ?? 0)}
          </p>
        </TableCell>*/}

        {/* Fees Amount */}

        <TableCell>
          <p
            className="text-sm font-medium"
            // style={{
            //   color:
            //     (order.tax_amount ?? 0) < 0
            //       ? "hsl(var(--chart-4))"
            //       : "hsl(var(--chart-3))",
            // }}
            style={{
              color: "hsl(var(--chart-4))",
            }}
          >
            {formatCurrency(order.tax_amount ?? 0, currency)}
          </p>
        </TableCell>

        {/* Shipping Costs */}
        {/*<TableCell>
          <p
            className="text-sm font-medium"
            style={{
              color:
                order?.shipping_amount < 0
                  ? "hsl(var(--chart-4))"
                  : "hsl(var(--chart-3))",
            }}
          >
            {formatCurrency(order?.shipping_amount ?? 0)}
          </p>
        </TableCell>*/}

        {/* Net Amount */}
        <TableCell>
          <p
            className="text-sm font-medium"
            style={{
              color:
                (order.net_amount ?? 0) < 0
                  ? "hsl(var(--chart-4))"
                  : "hsl(var(--chart-3))",
            }}
          >
            {formatCurrency(order.net_amount ?? 0, currency)}
          </p>
        </TableCell>

        {/* Date */}
        <TableCell>
          <HStack align="center" gap={2}>
            <Clock className="h-3 w-3" />
            <span className="text-sm font-light truncate">
              {format(new Date(order.created_at), "yyyy-MM-dd HH:mm")}
            </span>
          </HStack>
        </TableCell>

        {/* Actions */}
        {/*<TableCell>
          <HStack justify="end">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
              <span className="sr-only">More actions</span>
            </Button>
          </HStack>
        </TableCell>*/}
      </TableRow>

      {/* Order Sheet - moved outside of table structure */}
      <TransactionTableSheet
        order={order}
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
