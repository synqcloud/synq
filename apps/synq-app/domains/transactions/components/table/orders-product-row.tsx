"use client";
// Core
import { useQuery } from "@tanstack/react-query";
// Components
import { Button, TableCell, TableRow } from "@synq/ui/component";
import { Package, Search, Loader2 } from "lucide-react";
// Utils
import { cn } from "@synq/ui/utils";
import { formatCurrency } from "@/shared/utils/format-currency";
// Services
import { OrderService } from "@synq/supabase/services";

export function OrderItemsRows({
  orderId,
  isIntegration,
}: {
  orderId: string;
  isIntegration: boolean;
}) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["transactionItems", orderId],
    queryFn: () => OrderService.fetchUserOrderItems("client", orderId),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <TableRow
        className={cn(
          "border-b-0",
          isIntegration && "border-l-2 border-l-blue-500/70 bg-blue-50/10",
        )}
      >
        <TableCell className="py-2 px-4 align-middle">
          <div className="flex items-center gap-2 ml-8">
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50 flex-shrink-0" />
            <span className="text-xs text-muted-foreground/60 font-light">
              Loading...
            </span>
          </div>
        </TableCell>
        <TableCell className="py-2 px-4" />
        <TableCell className="py-2 px-4" />
        <TableCell className="py-2 px-4" />
        <TableCell className="py-2 px-4" />
      </TableRow>
    );
  }

  if (items.length === 0) {
    return (
      <TableRow
        className={cn(
          "border-b-0",
          isIntegration && "border-l-2 border-l-blue-500/70 bg-blue-50/10",
        )}
      >
        <TableCell className="py-2 px-4 align-middle">
          <div className="flex items-center gap-2 ml-8">
            <Package className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
            <span className="text-xs text-muted-foreground/60 font-light">
              No products
            </span>
          </div>
        </TableCell>
        <TableCell className="py-2 px-4" />
        <TableCell className="py-2 px-4" />
        <TableCell className="py-2 px-4" />
        <TableCell className="py-2 px-4" />
      </TableRow>
    );
  }

  return (
    <>
      {items.map((item, index) => (
        <TableRow
          key={item.item_id}
          className={cn(
            "hover:bg-accent bg-muted/50 transition-colors group/item border-l-2 border-l-primary/70",
            index === items.length - 1 ? "border-b" : "border-b-0",
          )}
        >
          {/* Card Name + Stock Details */}
          <TableCell className="py-1.5 px-4 align-middle">
            <div className="flex flex-col gap-1 w-full ml-8">
              <div className="flex items-center gap-1.5 w-full min-w-0">
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30 flex-shrink-0" />
                <span className="text-xs font-light text-foreground/90 truncate">
                  {item.card_name}
                </span>
              </div>

              {/* Stock details */}
              <div className="text-xs text-muted-foreground/60 flex flex-wrap gap-2 w-full">
                {item.condition && <span>Condition: {item.condition}</span>}
                {item.grading && <span>Grading: {item.grading}</span>}
                {item.language && <span>Language: {item.language}</span>}
                {item.sku && <span>SKU: {item.sku}</span>}
                {item.location && <span>Location: {item.location}</span>}
              </div>
            </div>
          </TableCell>

          {/* Quantity and Unit Price */}
          <TableCell className="py-1.5 px-4 align-middle">
            <div className="text-xs font-light text-muted-foreground/70 truncate">
              Qty {item.quantity} • {formatCurrency(item.unit_price || 0)}
            </div>
          </TableCell>

          {/* Game and Set */}
          <TableCell className="py-1.5 px-4 align-middle">
            <div className="text-xs font-light text-muted-foreground/70">
              <div className="truncate">{item.game_name}</div>
              <div className="text-muted-foreground/50 truncate">
                {item.set_name}
              </div>
            </div>
          </TableCell>

          {/* Item Total */}
          <TableCell className="py-1.5 px-4 align-middle text-right">
            <span className="text-xs font-medium text-muted-foreground/80">
              {formatCurrency((item.quantity ?? 0) * (item.unit_price ?? 0))}
            </span>
          </TableCell>

          {/* Search column */}
          <TableCell className="py-1.5 px-4 align-middle text-right">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/inventory/item/${item.core_card_id}`, "_blank");
              }}
              className="h-5 w-5 p-0 hover:bg-muted/30 opacity-60 group-hover/item:opacity-100 transition-all duration-150"
              title="Look up product"
            >
              <Search className="h-3 w-3 text-muted-foreground/60" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
