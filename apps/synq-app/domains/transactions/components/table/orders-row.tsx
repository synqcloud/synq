// Core
import { useState } from "react";
import { format } from "date-fns";
// Components
import { TableCell, TableRow } from "@synq/ui/component";
import { Clock, Package, Boxes, Zap, ChevronRight } from "lucide-react";
import { OrderItemsRows } from "./orders-product-row";
import { MarketplaceIcon } from "../marketplace-icon";

// Utils
import { formatCurrency } from "@/shared/utils/format-currency";

import { cn } from "@synq/ui/utils";
// Services
import { UserOrder } from "@synq/supabase/services";

export function OrderRowGroup({
  order,
}: {
  order: UserOrder & { total_quantity: number };
}) {
  const [expanded, setExpanded] = useState(false);

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

  return (
    <>
      {/* Main Order Row */}
      <TableRow
        className={cn(
          "group hover:bg-muted/30 transition-colors cursor-pointer border-b",
          expanded
            ? "border-b-0 border-l-2 border-l-blue-500/70"
            : "last:border-0",
          order.is_integration && !expanded && "bg-primary/10",
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status */}
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
              className={`w-2 h-2 rounded-full flex-shrink-0 ${getOrderStatusColor(order.order_status)}`}
            />
            <span className="text-sm font-light truncate">
              {getOrderStatusLabel(order.order_status)}
            </span>
            {order.is_integration && (
              <div className="flex items-center flex-shrink-0">
                <Zap className="h-3 w-3 text-blue-500/70 ml-1" />
              </div>
            )}
          </div>
        </TableCell>

        {/* Products */}
        <TableCell className="py-4 px-4 align-middle">
          <div className="flex items-center gap-2 min-w-0">
            {order.total_quantity > 1 ? (
              <Boxes className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
            ) : (
              <Package className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
            )}
            <span className="font-light text-sm truncate">
              {order.total_quantity ?? 0} item
              {order.total_quantity !== 1 ? "s" : ""}
            </span>
          </div>
        </TableCell>

        {/* Source */}
        <TableCell className="py-4 px-4 align-middle">
          <div className="min-w-0">
            <MarketplaceIcon
              marketplace={order.source || "Manual"}
              isIntegration={order.is_integration}
            />
          </div>
        </TableCell>

        {/* Net Amount */}
        <TableCell className="py-4 px-4 align-middle text-right">
          <p
            className="text-sm font-medium"
            style={{ color: "hsl(var(--chart-3))" }}
          >
            {formatCurrency(order.net_amount ?? 0)}
          </p>
        </TableCell>

        {/* Date */}
        <TableCell className="py-4 px-4 align-middle text-right">
          <div className="flex items-center gap-2 justify-end min-w-0">
            <Clock className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
            <span className="text-sm font-light text-muted-foreground/80 truncate">
              {format(new Date(order.created_at), "MMM dd")}
            </span>
          </div>
        </TableCell>
      </TableRow>

      {/* Child Rows for Order Items */}
      {expanded && (
        <OrderItemsRows
          orderId={order.id}
          isIntegration={order.is_integration}
        />
      )}
    </>
  );
}
