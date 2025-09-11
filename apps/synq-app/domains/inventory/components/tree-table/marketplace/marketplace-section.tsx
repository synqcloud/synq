import React from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Button,
  HStack,
} from "@synq/ui/component";
import { Plus } from "lucide-react";
import { MarketplaceListingPopover } from "../marketplace/marketplace-listing-popover";
import { UserStockWithListings } from "@synq/supabase/services";

type MarketplaceSectionProps = {
  marketplaces: string[];
  onOpenDialog: () => void;
  stock?: UserStockWithListings;
  cardId?: string;
  isEditing?: boolean;
};

export function MarketplaceSection({
  marketplaces,
  onOpenDialog,
  stock,
  cardId,
}: MarketplaceSectionProps) {
  const marketplacePrices = stock?.marketplace_prices || {};

  return (
    <TooltipProvider delayDuration={0}>
      <HStack gap={2} align="center" wrap="wrap">
        {marketplaces.map((mp: string) => (
          <MarketplaceListingPopover
            key={mp}
            stockId={stock?.stock_id || ""}
            marketplace={mp}
            currentPrice={marketplacePrices[mp]}
            cardId={cardId || ""}
          />
        ))}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-6 h-6 border-dashed hover:border-primary/50 hover:bg-primary/5"
              onClick={onOpenDialog}
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
  );
}
