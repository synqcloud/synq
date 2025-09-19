// Core
import React, { useState } from "react";

import { AddMarketplaceDialog } from "./marketplace/add-marketplace-dialog";

// Services
import {
  UserStockWithListings,
  InventoryService,
} from "@synq/supabase/services";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
// Hooks and utilities
import { useStockData } from "../../hooks/use-stock-data";
import { useStockEdit, EditData } from "../../hooks/use-stock-edit";
import { validateStock } from "../../utils/stock-validation";
import { StockDisplay } from "./stock/stock-display";
import { StockEditForm } from "./stock/stock-edit-form";

// Providers
import { useCurrency } from "@/shared/contexts/currency-context";
import { formatCurrency } from "@/shared/utils/format-currency";

type StockTableRowProps = {
  stock: UserStockWithListings;
  cardId: string;
  existingCombinations?: Array<{
    condition?: string;
    language: string;
  }>;
};

export default function StockTableRow({
  stock,
  cardId,
  existingCombinations = [],
}: StockTableRowProps) {
  const queryClient = useQueryClient();
  const { currency } = useCurrency();

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

  const handleSave = async () => {
    if (!hasChanges(stock, editData)) {
      toast.info("No changes detected.");
      cancelEdit();
      return;
    }

    const validationError = validateStock(editData, existingCombinations);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const result = await InventoryService.updateStockViaEdge(
        "client",
        stock.stock_id,
        buildUpdatePayload(editData),
      );

      if (!result.success) {
        handleUpdateError(result.error);
        return;
      }

      invalidateQueries(queryClient, cardId);
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
            /* Mobile Edit Mode */
            <div className="space-y-4">
              {/* First row: Quantity, Condition, Cost */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Qty
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={editData.quantity}
                    onChange={(e) =>
                      updateField("quantity", parseInt(e.target.value) || 1)
                    }
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Condition
                  </span>
                  <select
                    value={editData.condition || ""}
                    onChange={(e) => updateField("condition", e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  >
                    <option value="">Select</option>
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Cost
                  </span>
                  <input
                    type="number"
                    step={0.01}
                    min={0}
                    value={editData.cogs || ""}
                    onChange={(e) =>
                      updateField("cogs", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
              </div>

              {/* Second row: SKU, Location, Language */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    SKU
                  </span>
                  <input
                    value={editData.sku || ""}
                    onChange={(e) => updateField("sku", e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Location
                  </span>
                  <input
                    value={editData.location || ""}
                    onChange={(e) => updateField("location", e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Language
                  </span>
                  <select
                    value={editData.language || ""}
                    onChange={(e) => updateField("language", e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  >
                    <option value="">Select</option>
                    {languages.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Third row: Marketplaces */}
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Marketplaces
                </span>
                <div className="flex items-center gap-2">
                  {marketplaces.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {marketplaces.map((marketplace) => (
                        <span
                          key={marketplace}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                        >
                          {marketplace}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No marketplaces
                    </span>
                  )}
                  <button
                    onClick={() => setIsDialogOpen(true)}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            /* Mobile Display Mode */
            <div className="space-y-3">
              {/* First row: Quantity, Condition, Cost */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      Qty
                    </span>
                    <span className="font-medium">{stock.quantity || "-"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      Condition
                    </span>
                    <span className={getConditionColor(stock.condition)}>
                      {stock.condition || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      Cost
                    </span>
                    <span className="text-accent-foreground">
                      {stock.cogs != null
                        ? formatCurrency(stock.cogs, currency)
                        : "-"}
                    </span>
                  </div>
                </div>
                {/* Actions on the right */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={startEdit}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Second row: SKU, Location, Language */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      SKU
                    </span>
                    <span className="text-sm">{stock.sku || "-"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      Location
                    </span>
                    <span className="text-sm">{stock.location || "-"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      Language
                    </span>
                    <span className="text-sm">{stock.language || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Third row: Marketplaces */}
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Marketplaces
                </span>
                <div className="flex items-center gap-2">
                  {marketplaces.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {marketplaces.map((marketplace) => (
                        <span
                          key={marketplace}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                        >
                          {marketplace}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                  <button
                    onClick={() => setIsDialogOpen(true)}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
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

// Utility functions
function hasChanges(stock: UserStockWithListings, editData: EditData): boolean {
  return (
    editData.quantity !== stock.quantity ||
    editData.condition !== (stock.condition || "") ||
    editData.cogs !== stock.cogs ||
    editData.sku !== stock.sku ||
    editData.location !== stock.location ||
    editData.language !== stock.language
  );
}

function buildUpdatePayload(editData: EditData) {
  return {
    change_type: "manual_edit" as const,
    quantity_new: editData.quantity,
    condition: editData.condition,
    cost: editData.cogs,
    sku: editData.sku,
    location: editData.location,
    language: editData.language,
  };
}

function handleUpdateError(error: string) {
  switch (error) {
    case "duplicate":
      toast.error("This combination already exists in your inventory.");
      break;
    case "invalid_input":
      toast.error("Invalid input. Please check your data.");
      break;
    case "server_error":
      toast.error("Server error. Please try again later.");
      break;
    default:
      toast.error("Failed to update stock: " + error);
  }
}

function invalidateQueries(queryClient: any, cardId: string) {
  queryClient.invalidateQueries({ queryKey: ["stock", cardId] });
  queryClient.refetchQueries({ queryKey: ["notification-count"] });
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

function getConditionColor(condition: string | null): string {
  if (!condition) return "";

  const conditionColors: Record<string, string> = {
    "near mint": "text-green-600",
    "lightly played": "text-yellow-600",
    played: "text-red-600",
  };

  return conditionColors[condition.toLowerCase()] || "";
}
