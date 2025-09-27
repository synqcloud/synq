// Core
import React, { useState } from "react";

import { AddMarketplaceDialog } from "../../dialogs/add-marketplace-dialog";

// Services
import {
  UserStockWithListings,
  InventoryService,
} from "@synq/supabase/services";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Hooks and utilities
import { useStockData } from "@/domains/inventory/hooks/use-stock-data";
import { useStockEdit } from "@/domains/inventory/hooks/use-stock-edit";
import { validateStock } from "@/domains/inventory/utils/stock-validation";
import { StockDisplay } from "./stock-display";
import { StockEditForm } from "@/domains/inventory/components/forms/stock-edit-form";
import {
  buildStockUpdatePayload,
  hasStockChanges,
} from "@/features/inventory/utils/stock-helpers";

type StockTableRowProps = {
  stock: UserStockWithListings;
  cardId: string;
};

export default function StockTableRow({ stock, cardId }: StockTableRowProps) {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { conditions, languages } = useStockData();

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

  // Only check for changes when editing
  const hasChanges = isEditing
    ? hasStockChanges(stock, editData, marketplaces)
    : false;

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
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while updating stock.");
    }
  };

  return (
    <div className="bg-background w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div
          className="px-4 py-2 border-b border-border w-full"
          style={{ paddingLeft: `${64 + 3 * 24}px` }}
        >
          <div
            className="grid gap-2 text-sm items-center w-full"
            style={{
              gridTemplateColumns:
                "minmax(40px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(60px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(120px, 2fr) minmax(70px, 1fr)",
            }}
          >
            {isEditing ? (
              <StockEditForm
                editData={editData}
                conditions={conditions}
                languages={languages}
                onFieldChange={updateField}
                marketplaces={marketplaces}
                onOpenDialog={() => setIsDialogOpen(true)}
                onSave={handleSave}
                onCancel={cancelEdit}
                hasChanges={hasChanges}
              />
            ) : (
              <StockDisplay
                stock={stock}
                marketplaces={marketplaces}
                cardId={cardId}
                onEdit={startEdit}
                onOpenDialog={() => setIsDialogOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div
          className="px-4 py-3 border-b border-border"
          style={{ paddingLeft: `${64 + 3 * 24}px` }}
        >
          {isEditing ? (
            <StockEditForm
              editData={editData}
              conditions={conditions}
              languages={languages}
              onFieldChange={updateField}
              marketplaces={marketplaces}
              onOpenDialog={() => setIsDialogOpen(true)}
              onSave={handleSave}
              onCancel={cancelEdit}
              hasChanges={hasChanges}
            />
          ) : (
            <StockDisplay
              stock={stock}
              marketplaces={marketplaces}
              cardId={cardId}
              onEdit={startEdit}
              onOpenDialog={() => setIsDialogOpen(true)}
            />
          )}
        </div>
      </div>

      <AddMarketplaceDialog
        open={isDialogOpen}
        onOpenChangeAction={setIsDialogOpen}
        stockId={stock.stock_id}
        currentMarketplaces={marketplaces}
        onMarketplaceAddedAction={addMarketplace}
        onMarketplaceRemovedAction={removeMarketplace}
      />
    </div>
  );
}
