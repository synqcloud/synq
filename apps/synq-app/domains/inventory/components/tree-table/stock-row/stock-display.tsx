import React from "react";
import { UserStockWithListings } from "@synq/supabase/services";
import { StockTableActions } from "./stock-table-actions";
import { MarketplaceDisplay } from "./marketplace/marketplace-display";
import { useCurrency } from "@/shared/contexts/currency-context";
import { formatCurrency } from "@/shared/utils/format-currency";
import { getConditionColor } from "@/features/inventory/utils/condition-colors";
import { Button, Label, HStack, VStack } from "@synq/ui/component";
import { Edit, Plus } from "lucide-react";

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
      {/* Desktop View */}
      <div className="hidden md:contents">
        {/* Quantity */}
        <span className="font-medium">{stock.quantity || "-"}</span>
        {/* Condition */}
        <span className={getConditionColor(stock.condition)}>
          {stock.condition || "-"}
        </span>
        {/* Cost (COGS) */}
        <span className="text-accent-foreground">
          {stock.cogs != null ? formatCurrency(stock.cogs, currency) : "-"}
        </span>
        {/* SKU */}
        <span className="text-foreground">{stock.sku || "-"}</span>
        {/* Location */}
        <span className="text-foreground">{stock.location || "-"}</span>
        {/* Language */}
        <span className="text-foreground">{stock.language || "-"}</span>
        {/* Marketplaces */}
        <MarketplaceDisplay
          marketplaces={marketplaces}
          onOpenDialog={onOpenDialog}
        />
        {/* Actions */}
        <StockTableActions cardId={cardId} onEdit={onEdit} />
      </div>

      {/* Mobile View */}
      <VStack className="block md:hidden" gap={3}>
        {/* First row: Quantity, Condition, Cost */}
        <HStack justify="between" align="center">
          <HStack gap={4} align="center">
            <VStack gap={1}>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Qty
              </Label>
              <span className="font-medium">{stock.quantity || "-"}</span>
            </VStack>
            <VStack gap={1}>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Condition
              </Label>
              <span className={getConditionColor(stock.condition)}>
                {stock.condition || "-"}
              </span>
            </VStack>
            <VStack gap={1}>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Cost
              </Label>
              <span className="text-accent-foreground">
                {stock.cogs != null
                  ? formatCurrency(stock.cogs, currency)
                  : "-"}
              </span>
            </VStack>
          </HStack>
          {/* Actions on the right */}
          <HStack gap={2}>
            <Button size="icon" variant="ghost" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          </HStack>
        </HStack>

        {/* Second row: SKU, Location, Language */}
        <HStack justify="between" align="center">
          <HStack gap={4} align="center">
            <VStack gap={1}>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                SKU
              </Label>
              <span className="text-sm">{stock.sku || "-"}</span>
            </VStack>
            <VStack gap={1}>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Location
              </Label>
              <span className="text-sm">{stock.location || "-"}</span>
            </VStack>
            <VStack gap={1}>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Language
              </Label>
              <span className="text-sm">{stock.language || "-"}</span>
            </VStack>
          </HStack>
        </HStack>

        {/* Third row: Marketplaces */}
        <VStack gap={2}>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Marketplaces
          </Label>
          <HStack gap={2} align="center">
            {marketplaces.length > 0 ? (
              <HStack gap={2} wrap="wrap">
                {marketplaces.map((marketplace) => (
                  <span
                    key={marketplace}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                  >
                    {marketplace}
                  </span>
                ))}
              </HStack>
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={onOpenDialog}
              className="flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </>
  );
}
