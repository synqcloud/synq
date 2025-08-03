"use client";

import { formatCurrency } from "../utils/format-currency";

interface UnderperformingItem {
  sku: string;
  sales: number;
  revenue: number;
  margin: number;
  stockLevel: number;
  daysOfStock: number;
  trend: "up" | "down" | "stable";
  issue: string;
}

interface NeedsAttentionCardProps {
  data: UnderperformingItem[];
}

export function NeedsAttentionCard({ data }: NeedsAttentionCardProps) {
  return (
    <div className="border border-border rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-foreground">Needs Attention</h2>
        <p className="text-sm text-muted-foreground">
          Products requiring action
        </p>
      </div>
      <div className="space-y-4">
        {data.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-red-50/30"
          >
            <div className="flex-1">
              <div className="font-medium text-foreground text-sm">
                {item.sku}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {item.sales} units sold
              </div>
              <div className="text-xs text-red-600 mt-1">{item.issue}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-foreground text-sm">
                {formatCurrency(item.revenue)}
              </div>
              <div className="text-xs text-red-600">
                {(item.margin * 100).toFixed(0)}% margin
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
