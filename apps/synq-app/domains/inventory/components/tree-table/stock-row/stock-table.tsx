// Core
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// Components
import StockTableRow from "./stock-table-row";
import { AddStockDialog } from "../../dialogs/add-stock-dialog";
import { Plus } from "lucide-react";
import { HStack, VStack } from "@synq/ui/component"; // Add Stack imports
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
  const [isActive, setIsActive] = useState(true);

  const { data: stockItems, isLoading } = useQuery({
    queryKey: ["stock", cardId, isActive],
    queryFn: () =>
      InventoryService.fetchStockByCard("client", cardId, isActive),
  });

  const handleAddClick = () => {
    setShowAddStockDialog(true);
  };

  const leftPadding = `${64 + 1.5 * 24}px`;

  if (isLoading) {
    return (
      <VStack className="bg-background">
        <HStack
          gap={3}
          align="center"
          className="px-4 py-3 border-b border-border bg-muted/20 animate-pulse"
          style={{ paddingLeft: leftPadding }}
        >
          {/* Simple loading dots animation */}
          <HStack gap={1}>
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
          </HStack>
          <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
            Loading stock details...
          </span>
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack className="bg-background w-full">
      {/* Desktop Headers for Stock Details */}
      <VStack
        className="hidden md:block px-4 py-2 bg-muted text-sm font-medium text-muted-foreground border-b w-full"
        style={{ paddingLeft: leftPadding }}
      >
        <HStack gap={4} align="center">
          <div
            className="grid gap-2 text-sm flex-1"
            style={{
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
        </HStack>
      </VStack>

      {/* Add Stock Row */}
      <HStack
        gap={3}
        align="center"
        className="px-4 py-3 border-b border-border bg-accent/30 hover:bg-accent/50 cursor-pointer transition-colors"
        style={{ paddingLeft: leftPadding }}
        onClick={handleAddClick}
      >
        <Plus className="w-4 h-4 text-primary" />
        <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
          Add new stock
        </span>
      </HStack>

      {/* Stock Details */}
      {stockItems && stockItems.length > 0 ? (
        stockItems.map((stock: UserStockWithListings) => (
          <StockTableRow key={stock.stock_id} stock={stock} cardId={cardId} />
        ))
      ) : (
        <HStack
          gap={3}
          align="center"
          className="px-4 py-3 border-b border-border bg-muted/10"
          style={{ paddingLeft: leftPadding }}
        >
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
          <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
            No {isActive ? "active" : "inactive"} stock available
          </span>
        </HStack>
      )}

      {/* Add Stock Dialog */}
      <AddStockDialog
        open={showAddStockDialog}
        onOpenChangeAction={setShowAddStockDialog}
        cardId={cardId}
        cardName={cardName}
      />
    </VStack>
  );
}
