"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@synq/ui/component";
import { InventoryTable } from "./inventory-table";
import { InventoryStats as InventoryStatsComponent } from "./inventory-stats";
import { InventoryItem, InventoryStats } from "../../types/integrations";

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  stats: InventoryStats | null;
  loading: boolean;
  error: string;
  formatPrice: (cents: number, currency: string) => string;
}

export const InventoryDialog: React.FC<InventoryDialogProps> = ({
  open,
  onOpenChange,
  items,
  stats,
  loading,
  error,
  formatPrice,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw] min-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Magic: The Gathering Inventory</DialogTitle>
          <DialogDescription>
            Your complete MTG card inventory from CardTrader
            {stats && (
              <span className="ml-2 text-xs">
                ({stats.matched} matched, {stats.unmatched} unmatched of{" "}
                {stats.total} total)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">
                Loading inventory...
              </div>
            </div>
          ) : error ? (
            <div className="text-sm text-red-600 py-4">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4">
              No inventory items found
            </div>
          ) : (
            <InventoryTable items={items} formatPrice={formatPrice} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
