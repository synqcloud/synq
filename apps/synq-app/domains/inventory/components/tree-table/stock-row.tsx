// Core
import React from "react";

// Components
import StockActions from "./stock-actions";

// Services
import { UserStock } from "@synq/supabase/services";

// Optimized condition styling
const conditionColors: Record<string, string> = {
  "near mint": "text-green-600",
  "lightly played": "text-yellow-600",
  played: "text-red-600",
};

export default function StockRow({
  stock,
  cardId,
}: {
  stock: UserStock;
  cardId: string;
}) {
  return (
    <div className="bg-background">
      {/* Desktop Stock Detail Row */}
      <div className="hidden md:block">
        <div
          className="px-4 py-2 border-b border-border hover:bg-accent"
          style={{ paddingLeft: `${64 + 3 * 24}px` }}
        >
          <div className="grid grid-cols-9 gap-4 text-sm">
            <span className="font-medium">{stock.quantity || "-"}</span>
            <span
              className={conditionColors[stock.condition.toLowerCase()] || ""}
            >
              {stock.condition || "-"}
            </span>
            <span className="text-primary">{stock.grading || "-"}</span>
            <span className="text-accent-foreground">
              {stock.cogs ? `${stock.cogs.toFixed(2)}` : "-"}
            </span>
            <span className="text-foreground">{stock.sku || "-"}</span>
            <span className="text-foreground">{stock.location || "-"}</span>
            <span className="text-foreground text-xs">
              {stock.lastUpdated || "-"}
            </span>
            <StockActions stockId={stock.id} cardId={cardId} size="md" />
          </div>
        </div>
      </div>

      {/* Mobile Stock Detail Card */}
      <div className="md:hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg">
                {stock.quantity || "-"}
              </span>
              <span
                className={`text-sm font-medium ${conditionColors[stock.condition.toLowerCase()] || ""}`}
              >
                {stock.condition || "-"}
              </span>
              {stock.grading && (
                <span className="text-xs text-primary">
                  {stock.grading || "-"}
                </span>
              )}
              {stock.cogs && (
                <span className="text-xs text-accent-foreground">
                  ${stock.cogs.toFixed(2) || "-"}
                </span>
              )}
              {stock.sku && (
                <span className="text-xs text-muted-foreground">
                  {stock.sku || "-"}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs text-foreground">
            <span>{stock.location || "-"}</span>
            <span>{stock.lastUpdated || "-"}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-foreground">{stock.lastUpdated}</div>
            <StockActions stockId={stock.id} cardId={cardId} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
