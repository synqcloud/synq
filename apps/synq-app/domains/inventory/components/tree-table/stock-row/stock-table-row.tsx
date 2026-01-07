// Core
import React, { useCallback, useMemo } from "react";

// Services
import {
  UserStockWithListings,
  InventoryService,
} from "@synq/supabase/services";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Components
import { AddMarketplaceDialog } from "../../dialogs/add-marketplace-dialog";
import { StockEditSheet } from "@/domains/inventory/components/forms/stock-edit-sheet";
import { MarketplaceIcon } from "@/shared/icons/marketplace-icon";
import {
  Button,
  Label,
  HStack,
  VStack,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Badge,
} from "@synq/ui/component";
import { Plus, Edit, ShoppingBag, FileCog } from "lucide-react";

// Hooks and utilities
import { useStockEdit } from "@/features/inventory/hooks/use-stock-edit";
import { useStockData } from "@/domains/inventory/hooks/use-stock-data";
import { useCurrency } from "@/shared/contexts/currency-context";
import { formatCurrency } from "@/shared/utils/format-currency";
import {
  getConditionColor,
  getConditionShortCode,
  getConditionVariant,
} from "@/features/inventory/utils/condition-colors";
import { validateStock } from "@/domains/inventory/utils/stock-validation";
import {
  buildStockUpdatePayload,
  hasStockChanges,
} from "@/features/inventory/utils/stock-helpers";
import { useQuickTransaction } from "@/shared/contexts/quick-transaction-context";
import { cn } from "@synq/ui/utils";
import { LANGUAGE_FLAGS } from "@/features/inventory/utils/language-flag";

type StockTableRowProps = {
  stock: UserStockWithListings;
  cardId: string;
};

export default function StockTableRow({ stock, cardId }: StockTableRowProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false);
  const { currency } = useCurrency();
  const { conditions, languages } = useStockData();
  const { addStockId, removeStockId, stockIds } = useQuickTransaction();

  // Check if this stock is already in the transaction
  const isInTransaction = useMemo(
    () => stockIds.includes(stock.stock_id),
    [stockIds, stock.stock_id],
  );

  // Check if stock is out of stock
  const isOutOfStock = useMemo(
    () => !stock.quantity || stock.quantity <= 0,
    [stock.quantity],
  );

  const {
    isEditing,
    editData,
    marketplaces,
    startEdit,
    cancelEdit,
    updateField,
    addMarketplace,
    removeMarketplace,
  } = useStockEdit(stock);

  const hasChanges = isEditing
    ? hasStockChanges(stock, editData, marketplaces)
    : false;

  // Memoize the click handler to prevent function recreation
  const handleAddToTransaction = useCallback(() => {
    if (isOutOfStock) return;

    if (isInTransaction) {
      removeStockId(stock.stock_id);
    } else {
      addStockId(stock.stock_id);
    }
  }, [
    stock.stock_id,
    addStockId,
    removeStockId,
    isInTransaction,
    isOutOfStock,
  ]);

  const handleEdit = () => {
    startEdit();
    setIsEditSheetOpen(true);
  };

  const handleCancel = () => {
    cancelEdit();
    setIsEditSheetOpen(false);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("No changes detected.");
      return;
    }

    const validationError = validateStock(editData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const result = await InventoryService.updateStockViaEdge(
        "client",
        stock.stock_id,
        buildStockUpdatePayload(editData),
      );

      if (!result.success) {
        toast.error(
          "Could not update stock, please try again or contact support.",
        );
        return;
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["stock", cardId] });
      queryClient.refetchQueries({ queryKey: ["notification-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      toast.success("Stock updated successfully!");
      cancelEdit();
      setIsEditSheetOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while updating stock.");
    }
  };

  // Memoize tooltip text
  const transactionButtonTooltip = useMemo(() => {
    if (isOutOfStock) return "Out of stock";
    if (isInTransaction) return "Remove from transaction";
    return "Add to transaction";
  }, [isOutOfStock, isInTransaction]);

  return (
    <div className="bg-background w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div
          className="px-4 py-2 border-b border-border w-full"
          style={{ paddingLeft: `${64 + 1.5 * 24}px` }}
        >
          <div
            className="grid gap-2 text-sm items-center w-full"
            style={{
              gridTemplateColumns:
                "minmax(40px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(60px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(120px, 2fr) minmax(70px, 1fr)",
            }}
          >
            {/* Quantity */}
            <span className="font-medium">{stock.quantity || "-"}</span>

            {/* Condition */}
            <Badge variant={getConditionVariant(stock.condition)}>
              {getConditionShortCode(stock.condition) || "-"}
            </Badge>

            {/* Cost (COGS) */}
            <span className="text-accent-foreground">
              {stock.cogs != null ? formatCurrency(stock.cogs, currency) : "-"}
            </span>

            {/* SKU */}
            <span className="text-foreground">{stock.sku || "-"}</span>

            {/* Location */}
            <span className="text-foreground">{stock.location || "-"}</span>

            {/* Language */}
            <span className="text-foreground flex items-center gap-1">
              {LANGUAGE_FLAGS[stock.language] && (
                <span>{LANGUAGE_FLAGS[stock.language]}</span>
              )}
              {stock.language || "-"}
            </span>
            {/* Marketplaces */}
            <TooltipProvider delayDuration={0}>
              <HStack gap={2} align="center" wrap="wrap">
                {marketplaces.map((mp: string) => (
                  <MarketplaceIcon
                    key={mp}
                    marketplace={mp}
                    showTooltip={false}
                  />
                ))}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-6 h-6 border-dashed hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Add marketplace
                  </TooltipContent>
                </Tooltip>
              </HStack>
            </TooltipProvider>

            {/* Actions */}
            <HStack gap={1} align="center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToTransaction();
                    }}
                    disabled={isOutOfStock}
                    className="h-7 w-7 p-0"
                  >
                    <ShoppingBag
                      className={cn("h-3.5 w-3.5 transition-all", {
                        "text-primary fill-primary/20": isInTransaction,
                      })}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {transactionButtonTooltip}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    className="h-7 w-7 p-0"
                  >
                    <FileCog className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Edit variant
                </TooltipContent>
              </Tooltip>
            </HStack>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div
          className="px-4 py-3 border-b border-border"
          style={{ paddingLeft: `${64 + 3 * 24}px` }}
        >
          <VStack gap={3}>
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
              <HStack gap={1}>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleAddToTransaction}
                        disabled={isOutOfStock}
                        className="group"
                      >
                        <ShoppingBag
                          className={`h-4 w-4 transition-all ${
                            isInTransaction
                              ? "fill-primary text-primary"
                              : "text-muted-foreground group-hover:text-destructive group-hover:fill-destructive/20"
                          }`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {transactionButtonTooltip}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button size="icon" variant="ghost" onClick={handleEdit}>
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
                  <span className="text-foreground flex items-center gap-1">
                    {LANGUAGE_FLAGS[stock.language] && (
                      <span>{LANGUAGE_FLAGS[stock.language]}</span>
                    )}
                    {stock.language || "-"}
                  </span>
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
                  onClick={() => setIsDialogOpen(true)}
                  className="flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </div>
      </div>

      {/* Marketplace Dialog */}
      <AddMarketplaceDialog
        open={isDialogOpen}
        onOpenChangeAction={setIsDialogOpen}
        stockId={stock.stock_id}
        currentMarketplaces={marketplaces}
        onMarketplaceAddedAction={addMarketplace}
        onMarketplaceRemovedAction={removeMarketplace}
      />

      {/* Edit Sheet */}
      <StockEditSheet
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        editData={editData}
        conditions={conditions}
        languages={languages}
        onFieldChange={updateField}
        marketplaces={marketplaces}
        onOpenMarketplaceDialog={() => setIsDialogOpen(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        hasChanges={hasChanges}
      />
    </div>
  );
}
