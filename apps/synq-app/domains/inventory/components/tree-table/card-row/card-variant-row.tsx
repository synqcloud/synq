// Core
import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Components
import { MarketplaceIcon } from "@/shared/icons/marketplace-icon";
import {
  Button,
  HStack,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@synq/ui/component";
import {
  Edit,
  ShoppingBag,
  ChevronRight,
  SquareArrowUp,
  FileCog,
} from "lucide-react";
import { AddMarketplaceDialog } from "../../dialogs/add-marketplace-dialog";
import { StockEditSheet } from "@/domains/inventory/components/forms/stock-edit-sheet";

// Services & Utils
import {
  UserStockWithListings,
  InventoryService,
} from "@synq/supabase/services";
import { useCurrency } from "@/shared/contexts/currency-context";
import { formatCurrency } from "@/shared/utils/format-currency";
import { getConditionColor } from "@/features/inventory/utils/condition-colors";
import { useStockEdit } from "@/features/inventory/hooks/use-stock-edit";
import { useStockData } from "@/domains/inventory/hooks/use-stock-data";
import { validateStock } from "@/domains/inventory/utils/stock-validation";
import {
  buildStockUpdatePayload,
  hasStockChanges,
} from "@/features/inventory/utils/stock-helpers";
import { useQuickTransaction } from "@/shared/contexts/quick-transaction-context";
import { cn } from "@synq/ui/utils";

type CardVariantRowProps = {
  stock: UserStockWithListings;
  cardId: string;
  paddingLeft: number;
};

export function CardVariantRow({
  stock,
  cardId,
  paddingLeft,
}: CardVariantRowProps) {
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const { conditions, languages } = useStockData();
  const { addStockId, removeStockId, stockIds } = useQuickTransaction();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Check if this stock is in the transaction
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

  const transactionButtonTooltip = useMemo(() => {
    if (isOutOfStock) return "Out of stock";
    if (isInTransaction) return "Remove from transaction";
    return "Add to transaction";
  }, [isOutOfStock, isInTransaction]);

  return (
    <>
      <div
        className={cn(
          "group flex items-center px-4 py-2 bg-background/50 hover:bg-accent/30 transition-colors border-b border-border/50",
          isOutOfStock && "opacity-60",
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {/* Chevron placeholder for alignment */}
        <ChevronRight className="w-4 h-4 mr-2 text-transparent" />

        {/* Condition & Language */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className={cn(
              "text-sm font-medium",
              getConditionColor(stock.condition),
            )}
          >
            {stock.condition || "—"}
          </span>
          <span className="text-sm text-muted-foreground">
            {stock.language || "—"}
          </span>
          <span className="text-sm font-medium text-foreground">
            ({stock.quantity || 0})
          </span>

          {isOutOfStock && (
            <span className="text-xs text-red-500 ml-2">(Out of Stock)</span>
          )}

          {stock?.sku && <span className="text-xs">sku: {stock.sku}</span>}
          {stock?.location && (
            <span className="text-xs">location: {stock.location}</span>
          )}
        </div>

        {/* Marketplaces */}
        <TooltipProvider delayDuration={0}>
          <HStack gap={1.5} align="center" className="mr-4">
            {marketplaces.length > 0 ? (
              marketplaces.map((mp: string) => (
                <MarketplaceIcon key={mp} marketplace={mp} showTooltip={true} />
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Not listed</span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDialogOpen(true);
                  }}
                >
                  <SquareArrowUp className="w-3.5 h-3.5 text-primary/70" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                List in marketplace
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
    </>
  );
}
