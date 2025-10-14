"use client";

import React from "react";
import { InventoryRow } from "./inventory-row";
import { InventoryItem } from "../../types/integrations";

interface InventoryTableProps {
  items: InventoryItem[];
  formatPrice: (cents: number, currency: string) => string;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  formatPrice,
}) => {
  return (
    <div className="overflow-auto max-h-[60vh]">
      <table className="w-full text-sm">
        <thead className="border-b sticky top-0 bg-background">
          <tr>
            <th className="text-left py-2 px-2">Card</th>
            <th className="text-left py-2 px-2">Set</th>
            <th className="text-center py-2 px-2">Foil</th>
            <th className="text-right py-2 px-2">Price</th>
            <th className="text-right py-2 px-2">Qty</th>
            <th className="text-right py-2 px-2">Collector Number</th>
            <th className="text-left py-2 px-2">Condition</th>
            <th className="text-center py-2 px-2">TCG ID</th>
            <th className="text-center py-2 px-2">Scryfall ID</th>
            <th className="text-center py-2 px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <InventoryRow
              key={`${item.productId}-${index}`}
              item={item}
              formatPrice={formatPrice}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
