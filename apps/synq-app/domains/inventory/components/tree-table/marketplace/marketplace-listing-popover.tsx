import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// Components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Input,
  Label,
  HStack,
  VStack,
} from "@synq/ui/component";
import { MarketplaceIcon } from "@/features/transactions/components";
import { Check, X, DollarSign } from "lucide-react";
// Services
import { InventoryService } from "@synq/supabase/services";

interface MarketplaceListingPopoverProps {
  stockId: string;
  marketplace: string;
  currentPrice?: number;
  cardId: string;
}

export function MarketplaceListingPopover({
  stockId,
  marketplace,
  currentPrice,
  cardId,
}: MarketplaceListingPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [price, setPrice] = useState(currentPrice?.toString() || "");
  const queryClient = useQueryClient();

  useEffect(() => {
    setPrice(currentPrice?.toString() || "");
  }, [currentPrice, isOpen]);

  const updatePriceMutation = useMutation({
    mutationFn: (newPrice: number | null) =>
      InventoryService.updateListingPrice(
        "client",
        stockId,
        marketplace,
        newPrice,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock", cardId] });
      setIsOpen(false);
    },
  });

  const handleSave = () => {
    const numPrice = price ? parseFloat(price) : null;
    if (numPrice !== null && (isNaN(numPrice) || numPrice < 0)) return;
    updatePriceMutation.mutate(numPrice);
  };

  const handleRemovePrice = () => {
    updatePriceMutation.mutate(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-primary/10 relative"
        >
          <MarketplaceIcon
            marketplace={marketplace}
            className="w-6 h-6"
            showTooltip={false}
          />
          {currentPrice && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <VStack gap={3}>
          {/* Marketplace header */}
          <HStack gap={2} align="center">
            <MarketplaceIcon
              marketplace={marketplace}
              className="w-5 h-5"
              showTooltip={false}
            />
            <span className="font-medium text-sm">{marketplace}</span>
          </HStack>

          {/* Price input */}
          <VStack gap={2}>
            <Label htmlFor="price" className="text-xs text-muted-foreground">
              Listing Price
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-8 text-sm h-8"
                disabled={updatePriceMutation.isPending}
              />
            </div>
          </VStack>

          {/* Action buttons */}
          <HStack gap={2} align="center">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updatePriceMutation.isPending}
              className="h-7 flex-1"
            >
              <Check className="w-3 h-3 mr-1" />
              Save
            </Button>
            {currentPrice && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemovePrice}
                disabled={updatePriceMutation.isPending}
                className="h-7 px-2"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={updatePriceMutation.isPending}
              className="h-7 px-2"
            >
              Cancel
            </Button>
          </HStack>
        </VStack>
      </PopoverContent>
    </Popover>
  );
}
