"use client";

import { formatCurrency } from "../utils/format-currency";

interface InventoryIssueItem {
  issue: string;
  value: number;
  skuCount: number;
  impact: "High" | "Medium" | "Low";
  category: string;
}

interface InventoryIssuesCardProps {
  data: InventoryIssueItem[];
}

export function InventoryIssuesCard({ data }: InventoryIssuesCardProps) {
  return (
    <div className="border border-border rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-foreground">
          Inventory Issues
        </h2>
        <p className="text-sm text-muted-foreground">
          Areas requiring attention
        </p>
      </div>
      <div className="space-y-4">
        {data.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg border border-border"
          >
            <div className="flex-1">
              <div className="font-medium text-foreground text-sm">
                {item.issue}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {item.skuCount} SKUs
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-foreground text-sm">
                {formatCurrency(item.value)}
              </div>
              <div
                className={`text-xs ${
                  item.impact === "High" ? "text-red-600" : "text-yellow-600"
                }`}
              >
                {item.impact}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
