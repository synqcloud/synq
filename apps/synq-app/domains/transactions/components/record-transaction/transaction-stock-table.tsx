// Core
import React, { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// Components
import { HStack, VStack } from "@synq/ui/component";
// Services
import {
  InventoryService,
  UserStockWithListings,
} from "@synq/supabase/services";
import TransactionStockTableRow from "./transaction-stock-table-row";

export default function TransactionStockTable({
  cardId,
  onAddToTransactionAction,
}: {
  cardId: string;
  onAddToTransactionAction?: (stockId: string) => void;
}) {
  const { data: stockItems, isLoading } = useQuery({
    queryKey: ["stock", cardId],
    queryFn: () => InventoryService.fetchStockByCard("client", cardId),
  });

  // Memoize styles to prevent recreation on every render
  const paddingStyle = useMemo(
    () => ({
      paddingLeft: `${64 + 3 * 24}px`,
    }),
    [],
  );

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns:
        "minmax(50px, auto) minmax(40px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(60px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(120px, 2fr)",
    }),
    [],
  );

  // Memoize the callback creator to prevent function recreation
  const createAddToTransactionHandler = useCallback(
    (stockId: string) => () => onAddToTransactionAction?.(stockId),
    [onAddToTransactionAction],
  );

  if (isLoading) {
    return (
      <VStack className="bg-background">
        <div
          className="px-4 py-3 border-b border-border bg-muted/20 animate-pulse"
          style={paddingStyle}
        >
          <HStack gap={3} align="center">
            <HStack gap={1}>
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
            </HStack>
            <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
              Loading stock details...
            </span>
          </HStack>
        </div>
      </VStack>
    );
  }

  return (
    <VStack className="bg-background w-full">
      {/* Desktop Headers for Stock Details */}
      <div
        className="hidden md:block px-4 py-2 bg-muted text-sm font-medium text-muted-foreground border-b w-full"
        style={paddingStyle}
      >
        <div className="grid gap-2 text-sm w-full" style={gridStyle}>
          <span>Add</span>
          <span>Qty</span>
          <span>Language</span>
          <span>Condition</span>
          <span title="Cost of Goods Sold - what you paid for the card">
            Cost (COGS)
          </span>
          <span>SKU</span>
          <span>Location</span>
          <span>Marketplaces</span>
        </div>
      </div>
      {/* Stock Details */}
      {stockItems && stockItems.length > 0 ? (
        stockItems.map((stock: UserStockWithListings) => (
          <TransactionStockTableRow
            key={stock.stock_id}
            stock={stock}
            onAddToTransactionAction={createAddToTransactionHandler(
              stock.stock_id,
            )}
          />
        ))
      ) : (
        <div className="px-4 py-3 border-b border-border bg-muted/10">
          <HStack gap={3} align="center">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
              No stock available
            </span>
          </HStack>
        </div>
      )}
    </VStack>
  );
}
