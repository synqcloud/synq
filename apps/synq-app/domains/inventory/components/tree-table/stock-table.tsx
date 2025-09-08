// Core
import React from "react";
import { useQuery } from "@tanstack/react-query";
// Components
import StockTableRow from "./stock-table-row";
// Services
import {
  InventoryService,
  UserStockWithListings,
} from "@synq/supabase/services";

export default function StockTable({ cardId }: { cardId: string }) {
  const { data: stockItems, isLoading } = useQuery({
    queryKey: ["stock", cardId],
    queryFn: () => InventoryService.fetchStockByCard("client", cardId),
  });

  if (isLoading) {
    return (
      <div className="bg-background">
        <div
          className="px-4 py-3 border-b border-border bg-muted/20 animate-pulse"
          style={{ paddingLeft: `${64 + 3 * 24}px` }}
        >
          <div className="flex items-center gap-3">
            {/* Simple loading dots animation */}
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
              Loading stock details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!stockItems || stockItems.length === 0) {
    return (
      <div className="bg-background">
        <div
          className="px-4 py-3 border-b border-border bg-muted/10"
          style={{ paddingLeft: `${64 + 3 * 24}px` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
            <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
              No stock available
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background w-full">
      {/* Desktop Headers for Stock Details */}
      <div
        className="hidden md:block px-4 py-2 bg-muted text-sm font-medium text-muted-foreground border-b w-full"
        style={{ paddingLeft: `${64 + 3 * 24}px` }}
      >
        <div
          className="grid gap-2 text-sm w-full"
          style={{
            gridTemplateColumns:
              "minmax(40px, 1fr) minmax(80px, 1.5fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(60px, 1fr) minmax(120px, 2fr) minmax(70px, 1fr) minmax(80px, 1fr)",
          }}
        >
          <span>Qty</span>
          <span>Condition</span>
          <span>Grading</span>
          <span title="Cost of Goods Sold - what you paid for the card">
            Cost (COGS)
          </span>
          <span>SKU</span>
          <span>Location</span>
          <span>Language</span>
          <span>Marketplaces</span>

          <span>Actions</span>
        </div>
      </div>

      {/* Stock Details */}
      {stockItems.map((stock: UserStockWithListings) => (
        <StockTableRow key={stock.stock_id} stock={stock} cardId={cardId} />
      ))}
    </div>
  );
}
