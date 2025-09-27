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
import { MarketplaceIcon } from "@/shared/icons/marketplace-icon";

type MarketplaceDisplayProps = {
  marketplaces: string[];
  onOpenDialog: () => void;
};

export function MarketplaceDisplay({
  marketplaces,
  onOpenDialog,
}: MarketplaceDisplayProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <HStack gap={2} align="center" wrap="wrap">
        {marketplaces.map((mp: string) => (
          <MarketplaceIcon key={mp} marketplace={mp} showTooltip={false} />
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
