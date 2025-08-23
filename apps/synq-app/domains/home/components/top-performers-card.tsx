"use client";

import { formatCurrency } from "../utils/format-currency";

interface TopPerformerItem {
  sku: string;
  sales: number;
  revenue: number;
  margin: number;
  stockLevel: number;
  daysOfStock: number;
  trend: "up" | "down" | "stable";
}

interface TopPerformersCardProps {
  data: TopPerformerItem[];
}

export function TopPerformersCard({ data }: TopPerformersCardProps) {
  return (
    <div className="border border-border rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-foreground">Top Performers</h2>
        <p className="text-sm text-muted-foreground">
          Best selling products this month
        </p>
      </div>
      <div className="space-y-4">
        {data.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-green-50/30"
          >
            <div className="flex-1">
              <div className="font-medium text-foreground text-sm">
                {item.sku}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {item.sales} units sold
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-foreground text-sm">
                {formatCurrency(item.revenue)}
              </div>
              <div className="text-xs text-green-600">
                {(item.margin * 100).toFixed(0)}% margin
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
