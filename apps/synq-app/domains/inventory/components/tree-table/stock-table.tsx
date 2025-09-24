// Core
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// Components
import StockTableRow from "./stock-table-row";
import { AddStockDialog } from "../add-stock-dialog";
import { Plus } from "lucide-react";
// Services
import {
  InventoryService,
  UserStockWithListings,
} from "@synq/supabase/services";

export default function StockTable({
  cardId,
  cardName,
}: {
  cardId: string;
  cardName: string;
}) {
  const [showAddStockDialog, setShowAddStockDialog] = useState(false);

  const { data: stockItems, isLoading } = useQuery({
    queryKey: ["stock", cardId],
    queryFn: () => InventoryService.fetchStockByCard("client", cardId),
  });

  const handleAddClick = () => {
    setShowAddStockDialog(true);
  };

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
            // Updated to match the 8 columns in StockTableRow
            gridTemplateColumns:
              "minmax(40px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(60px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(120px, 2fr) minmax(70px, 1fr)",
          }}
        >
          <span>Qty</span>
          <span>Condition</span>
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

      {/* Add Stock Row */}
      <div
        className="px-4 py-3 border-b border-border bg-accent/30 hover:bg-accent/50 cursor-pointer transition-colors"
        style={{ paddingLeft: `${64 + 3 * 24}px` }}
        onClick={handleAddClick}
      >
        <div className="flex items-center gap-3">
          <Plus className="w-4 h-4 text-primary" />
          <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
            Add new purchase
          </span>
        </div>
      </div>

      {/* Stock Details */}
      {stockItems && stockItems.length > 0 ? (
        stockItems.map((stock: UserStockWithListings) => (
          <StockTableRow key={stock.stock_id} stock={stock} cardId={cardId} />
        ))
      ) : (
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
      )}

      {/* Add Stock Dialog */}
      <AddStockDialog
        open={showAddStockDialog}
        onOpenChangeAction={setShowAddStockDialog}
        cardId={cardId}
        cardName={cardName}
      />
    </div>
  );
}
