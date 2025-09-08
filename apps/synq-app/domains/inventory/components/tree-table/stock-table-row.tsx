// Core
import React, { useState } from "react";
// Components
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Button,
  HStack,
  VStack,
} from "@synq/ui/component";
import { Plus } from "lucide-react";
import { AddMarketplaceDialog } from "./marketplace/add-marketplace-dialog";
import { StockTableActions } from "./stock-table-actions";
import { MarketplaceListingPopover } from "./marketplace/marketplace-listing-popover";
// Services
import { UserStockWithListings } from "@synq/supabase/services";

// Optimized condition styling
const conditionColors: Record<string, string> = {
  "near mint": "text-green-600",
  "lightly played": "text-yellow-600",
  played: "text-red-600",
};

export default function StockTableRow({
  stock,
  cardId,
}: {
  stock: UserStockWithListings;
  cardId: string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [marketplaces, setMarketplaces] = useState<string[]>(
    stock.marketplaces || [],
  );

  const handleMarketplaceAdded = (marketplace: string) => {
    setMarketplaces((prev) => [...prev, marketplace]);
  };

  const handleMarketplaceRemoved = (marketplace: string) => {
    setMarketplaces((prev) => prev.filter((m) => m !== marketplace));
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  // Get marketplace prices from stock data
  const marketplacePrices = stock.marketplace_prices || {};

  return (
    <div className="bg-background w-full">
      {/* Desktop Stock Detail Row */}
      <div className="hidden md:block">
        <div
          className="px-4 py-2 border-b border-border w-full"
          style={{ paddingLeft: `${64 + 3 * 24}px` }}
        >
          <div
            className="grid gap-2 text-sm items-center w-full"
            style={{
              gridTemplateColumns:
                "minmax(40px, 1fr) minmax(80px, 1.5fr) minmax(60px, 1fr) minmax(60px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(60px, 1fr) minmax(120px, 2fr) minmax(70px, 1fr) minmax(80px, 1fr)",
            }}
          >
            <span className="font-medium">{stock.quantity || "-"}</span>
            <span
              className={conditionColors[stock.condition.toLowerCase()] || ""}
            >
              {stock.condition || "-"}
            </span>
            <span className="text-primary">{stock.grading || "-"}</span>
            <span className="text-accent-foreground">
              {stock.cogs ? `$${stock.cogs.toFixed(2)}` : "-"}
            </span>
            <span className="text-foreground">{stock.sku || "-"}</span>
            <span className="text-foreground">{stock.location || "-"}</span>
            <span className="text-foreground">{stock.language || "-"}</span>
            <TooltipProvider delayDuration={0}>
              <HStack gap={2} align="center" wrap="wrap">
                {marketplaces.map((mp: string) => (
                  <MarketplaceListingPopover
                    key={mp}
                    stockId={stock.stock_id}
                    marketplace={mp}
                    currentPrice={marketplacePrices[mp]}
                    cardId={cardId}
                  />
                ))}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-6 h-6 border-dashed hover:border-primary/50 hover:bg-primary/5"
                      onClick={handleOpenDialog}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Add marketplace
                  </TooltipContent>
                </Tooltip>
              </HStack>
            </TooltipProvider>
            <StockTableActions cardId={cardId} size="md" />
          </div>
        </div>
      </div>

      {/* Mobile Stock Detail Card */}
      <div className="md:hidden">
        <VStack
          gap={2}
          className="px-4 py-3 border-b border-border bg-muted/50"
        >
          <HStack justify="between" align="start" className="mb-2">
            <HStack gap={2} align="center">
              <span className="font-medium text-lg">
                {stock.quantity || "-"}
              </span>
              <span
                className={`text-sm font-medium ${
                  conditionColors[stock.condition.toLowerCase()] || ""
                }`}
              >
                {stock.condition || "-"}
              </span>
              {stock.grading && (
                <span className="text-xs text-primary">{stock.grading}</span>
              )}
              {stock.cogs && (
                <span className="text-xs text-accent-foreground">
                  ${stock.cogs.toFixed(2)}
                </span>
              )}
              {stock.sku && (
                <span className="text-xs text-muted-foreground">
                  {stock.sku}
                </span>
              )}
            </HStack>
          </HStack>

          <HStack justify="between" className="text-xs text-foreground mb-1">
            <span>{stock.location || "-"}</span>
            <span>{stock.language || "-"}</span>
          </HStack>
        </VStack>
      </div>

      {/* Add Marketplace Dialog */}
      <AddMarketplaceDialog
        open={isDialogOpen}
        onOpenChangeAction={setIsDialogOpen}
        stockId={stock.stock_id}
        currentMarketplaces={marketplaces}
        onMarketplaceAddedAction={handleMarketplaceAdded}
        onMarketplaceRemovedAction={handleMarketplaceRemoved}
      />
    </div>
  );
}
