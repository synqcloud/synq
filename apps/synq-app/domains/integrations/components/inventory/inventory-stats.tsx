"use client";

import React from "react";
import { InventoryStats as InventoryStatsType } from "../../types/integrations";

interface InventoryStatsProps {
  stats: InventoryStatsType;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ stats }) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="flex-1 rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total Items</p>
        <p className="text-2xl font-semibold">{stats.total}</p>
      </div>
      <div className="flex-1 rounded-lg border p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
        <p className="text-sm text-green-700 dark:text-green-400">Matched</p>
        <p className="text-2xl font-semibold text-green-700 dark:text-green-400">
          {stats.matched}
        </p>
      </div>
      <div className="flex-1 rounded-lg border p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          Unmatched
        </p>
        <p className="text-2xl font-semibold text-yellow-700 dark:text-yellow-400">
          {stats.unmatched}
        </p>
      </div>
    </div>
  );
};
