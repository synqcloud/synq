"use client";
// Core
import { useQuery } from "@tanstack/react-query";
// Components
import { HStack, VStack } from "@synq/ui/component";
import { Package, Loader2 } from "lucide-react";
// Utils
import { cn } from "@synq/ui/utils";
import { formatCurrency } from "@/shared/utils/format-currency";
// Services
import { TransactionService } from "@synq/supabase/services";
import { useCurrency } from "@/shared/contexts/currency-context";

export function TransactionItemsDisplay({
  orderId,
  isIntegration,
}: {
  orderId: string;
  isIntegration: boolean;
}) {
  const { currency } = useCurrency();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["transactionItems", orderId],
    queryFn: () =>
      TransactionService.fetchUserTransactionItems("client", orderId),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <HStack justify="center" align="center" className="py-8">
        <HStack gap={2} align="center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Loading items...
          </span>
        </HStack>
      </HStack>
    );
  }

  if (items.length === 0) {
    return (
      <HStack justify="center" align="center" className="py-8">
        <HStack gap={2} align="center">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">No items found</span>
        </HStack>
      </HStack>
    );
  }

  return (
    <VStack gap={2}>
      {items.map((item) => (
        <div
          key={item.item_id}
          className={cn(
            "group p-3 rounded-md border bg-card hover:bg-muted/30 transition-colors",
            isIntegration && "border-l-2 border-l-blue-500",
          )}
        >
          <HStack justify="between" align="start" gap={3}>
            {/* Left: Card Info */}
            <VStack gap={1} className="flex-1 min-w-0">
              <HStack justify="between" align="center" className="w-full">
                <h4 className="font-medium text-sm text-foreground truncate">
                  {item.card_name}
                </h4>
                {/*<Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `/inventory/item/${item.core_card_id}`,
                      "_blank",
                    );
                  }}
                  title="View in inventory"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>*/}
              </HStack>

              <HStack
                gap={4}
                align="center"
                className="text-xs text-muted-foreground"
              >
                <span className="font-medium">{item.game_name}</span>
                {item.set_name && (
                  <>
                    <span>•</span>
                    <span>{item.set_name}</span>
                  </>
                )}
              </HStack>

              {/* Attributes Row */}
              <HStack gap={3} align="center" className="text-xs">
                {item.condition && (
                  <span className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                    {item.condition}
                  </span>
                )}
                {item.language && (
                  <span className="text-muted-foreground">{item.language}</span>
                )}
                {item.sku && (
                  <span className="font-mono text-muted-foreground text-xs">
                    {item.sku}
                  </span>
                )}
              </HStack>
            </VStack>

            {/* Right: Pricing */}
            <VStack align="end" gap={1} className="shrink-0 min-w-[120px]">
              {/* Quantity & Unit Price */}
              <HStack
                gap={1}
                align="center"
                className="text-xs text-muted-foreground"
              >
                <span className="font-medium">{item.quantity}</span>
                <span>×</span>
                <span>{formatCurrency(item.unit_price || 0, currency)}</span>
              </HStack>

              {/* Total Revenue */}
              <div className="font-semibold text-sm">
                {formatCurrency(
                  (item.quantity ?? 0) * (item.unit_price ?? 0),
                  currency,
                )}
              </div>

              {/* COGS & Profit */}
              {item.cogs !== null && item.cogs !== undefined && (
                <VStack align="end" gap={0.5} className="text-xs">
                  <div className="text-muted-foreground">
                    COGS{" "}
                    {formatCurrency(
                      (item.quantity ?? 0) * (item.cogs ?? 0),
                      currency,
                    )}
                  </div>
                  <div
                    className="font-medium"
                    style={{
                      color:
                        (item.quantity ?? 0) *
                          ((item.unit_price ?? 0) - (item.cogs ?? 0)) >=
                        0
                          ? "hsl(var(--chart-3))"
                          : "hsl(var(--chart-4))",
                    }}
                  >
                    {(item.quantity ?? 0) *
                      ((item.unit_price ?? 0) - (item.cogs ?? 0)) >=
                    0
                      ? "+"
                      : ""}
                    {formatCurrency(
                      (item.quantity ?? 0) *
                        ((item.unit_price ?? 0) - (item.cogs ?? 0)),
                      currency,
                    )}
                  </div>
                </VStack>
              )}
            </VStack>
          </HStack>
        </div>
      ))}
    </VStack>
  );
}
