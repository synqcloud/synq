import React from "react";
import { UserStockWithListings } from "@synq/supabase/services";
import { StockTableActions } from "../stock-table-actions";
import { MarketplaceSection } from "../marketplace/marketplace-section";

const conditionColors: Record<string, string> = {
  "near mint": "text-green-600",
  "lightly played": "text-yellow-600",
  played: "text-red-600",
};

type StockDisplayProps = {
  stock: UserStockWithListings;
  marketplaces: string[];
  cardId: string;
  onEdit: () => void;
  onOpenDialog: () => void;
};

export function StockDisplay({
  stock,
  marketplaces,
  cardId,
  onEdit,
  onOpenDialog,
}: StockDisplayProps) {
  return (
    <>
      {/* Quantity */}
      <span className="font-medium">{stock.quantity || "-"}</span>

      {/* Condition */}
      <span
        className={
          stock.condition
            ? conditionColors[stock.condition?.toLowerCase() || ""] || ""
            : ""
        }
      >
        {stock.condition || "-"}
      </span>

      {/* Cost (COGS) */}
      <span className="text-accent-foreground">
        {stock.cogs ? `$${stock.cogs.toFixed(2)}` : "-"}
      </span>

      {/* SKU */}
      <span className="text-foreground">{stock.sku || "-"}</span>

      {/* Location */}
      <span className="text-foreground">{stock.location || "-"}</span>

      {/* Language */}
      <span className="text-foreground">{stock.language || "-"}</span>

      {/* Marketplaces */}
      <MarketplaceSection
        stock={stock}
        marketplaces={marketplaces}
        cardId={cardId}
        onOpenDialog={onOpenDialog}
      />

      {/* Actions */}
      <StockTableActions cardId={cardId} onEdit={onEdit} />
    </>
  );
}
