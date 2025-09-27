import React from "react";
import { UserStockWithListings } from "@synq/supabase/services";
import { StockTableActions } from "./stock-table-actions";
import { MarketplaceSection } from "./marketplace/marketplace-section";
import { useCurrency } from "@/shared/contexts/currency-context";
import { formatCurrency } from "@/shared/utils/format-currency";

const conditionColors: Record<string, string> = {
  // TCGPlayer conditions
  "near mint": "text-green-600",
  "lightly played": "text-yellow-500",
  "moderately played": "text-orange-500",
  "heavily played": "text-red-600",
  damaged: "text-gray-400",

  // Cardmarket conditions
  mint: "text-green-700",
  excellent: "text-green-600",
  good: "text-yellow-500",
  "light played": "text-yellow-500",
  played: "text-red-600",
  poor: "text-gray-500",
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
  const { currency } = useCurrency();

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
        {formatCurrency(stock.cogs, currency)}
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
