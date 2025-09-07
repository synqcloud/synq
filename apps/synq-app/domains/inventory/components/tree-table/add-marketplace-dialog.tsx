"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
  HStack,
  VStack,
} from "@synq/ui/component";
import { MarketplaceIcon } from "@/features/transactions/components";
import { InventoryService } from "@synq/supabase/services";
import { Search, Check, Plus, X } from "lucide-react";
import { Input } from "@synq/ui/component";
import { cn } from "@synq/ui/utils";

interface AddMarketplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockId: string;
  currentMarketplaces: string[];
  onMarketplaceAdded: (marketplace: string) => void;
  onMarketplaceRemoved: (marketplace: string) => void;
}

export function AddMarketplaceDialog({
  open,
  onOpenChange,
  stockId,
  currentMarketplaces = [],
  onMarketplaceAdded,
  onMarketplaceRemoved,
}: AddMarketplaceDialogProps) {
  const [availableMarketplaces, setAvailableMarketplaces] = useState<string[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [marketplacesToRemove, setMarketplacesToRemove] = useState<string[]>(
    [],
  );

  // Load available marketplaces
  useEffect(() => {
    if (open) {
      loadMarketplaces();
    }
  }, [open]);

  const loadMarketplaces = async () => {
    try {
      setIsLoading(true);
      const marketplaces =
        await InventoryService.getAvailableMarketplaces("client");
      setAvailableMarketplaces(marketplaces);
    } catch (error) {
      console.error("Failed to load marketplaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter marketplaces based on search and current selections
  const filteredMarketplaces = availableMarketplaces.filter((marketplace) => {
    const matchesSearch = marketplace
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const notAlreadyAdded = !currentMarketplaces.includes(marketplace);
    return matchesSearch && notAlreadyAdded;
  });

  const handleMarketplaceToggle = (marketplace: string) => {
    setSelectedMarketplaces((prev) =>
      prev.includes(marketplace)
        ? prev.filter((m) => m !== marketplace)
        : [...prev, marketplace],
    );
  };

  const handleRemoveMarketplace = (marketplace: string) => {
    setMarketplacesToRemove((prev) =>
      prev.includes(marketplace)
        ? prev.filter((m) => m !== marketplace)
        : [...prev, marketplace],
    );
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);

      // Add new marketplaces
      for (const marketplace of selectedMarketplaces) {
        await InventoryService.addMarketplaceToStock(
          "client",
          stockId,
          marketplace,
        );
        onMarketplaceAdded(marketplace);
      }

      // Remove selected marketplaces
      for (const marketplace of marketplacesToRemove) {
        await InventoryService.removeMarketplaceFromStock(
          "client",
          stockId,
          marketplace,
        );
        onMarketplaceRemoved(marketplace);
      }

      setSelectedMarketplaces([]);
      setMarketplacesToRemove([]);
      setSearchQuery("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update marketplaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedMarketplaces([]);
    setMarketplacesToRemove([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  const hasChanges =
    selectedMarketplaces.length > 0 || marketplacesToRemove.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Marketplaces
          </DialogTitle>
          <DialogDescription>
            Select marketplaces where you want to list this stock item.
          </DialogDescription>
        </DialogHeader>

        <VStack gap={4} className="py-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search marketplaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Marketplaces */}
          {selectedMarketplaces.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                Selected ({selectedMarketplaces.length})
              </h4>
              <HStack gap={2} wrap="wrap">
                {selectedMarketplaces.map((marketplace) => (
                  <Badge
                    key={marketplace}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary border-primary/20"
                  >
                    <MarketplaceIcon
                      marketplace={marketplace}
                      showTooltip={false}
                      className="w-4 h-4"
                    />
                    <span className="text-xs">{marketplace}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-3 h-3 p-0 hover:bg-destructive/20 hover:text-destructive"
                      onClick={() => handleMarketplaceToggle(marketplace)}
                    >
                      <X className="w-2.5 h-2.5" />
                    </Button>
                  </Badge>
                ))}
              </HStack>
            </div>
          )}

          {/* Available Marketplaces */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">
              Available Marketplaces
            </h4>
            <div className="max-h-48 overflow-y-auto border border-border rounded-md">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Loading marketplaces...
                </div>
              ) : filteredMarketplaces.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {searchQuery
                    ? `No marketplaces found matching "${searchQuery}"`
                    : "All available marketplaces are already added"}
                </div>
              ) : (
                <VStack gap={0}>
                  {filteredMarketplaces.map((marketplace, index) => {
                    const isSelected =
                      selectedMarketplaces.includes(marketplace);
                    return (
                      <button
                        key={marketplace}
                        onClick={() => handleMarketplaceToggle(marketplace)}
                        className={cn(
                          "w-full p-3 text-left hover:bg-accent transition-colors flex items-center justify-between",
                          index !== filteredMarketplaces.length - 1 &&
                            "border-b border-border",
                          isSelected && "bg-primary/5 border-primary/20",
                        )}
                      >
                        <HStack gap={3} align="center">
                          <MarketplaceIcon
                            marketplace={marketplace}
                            showTooltip={false}
                            className="w-5 h-5"
                          />
                          <span className="text-sm font-medium">
                            {marketplace}
                          </span>
                        </HStack>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </VStack>
              )}
            </div>
          </div>

          {/* Current Marketplaces */}
          {currentMarketplaces.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Current Marketplaces ({currentMarketplaces.length})
              </h4>
              <HStack gap={2} wrap="wrap">
                {currentMarketplaces.map((marketplace) => {
                  const isMarkedForRemoval =
                    marketplacesToRemove.includes(marketplace);
                  return (
                    <Badge
                      key={marketplace}
                      variant={isMarkedForRemoval ? "destructive" : "outline"}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 transition-all cursor-pointer",
                        isMarkedForRemoval
                          ? "bg-destructive/10 text-destructive border-destructive/20 line-through opacity-70"
                          : "text-muted-foreground hover:bg-muted/50",
                      )}
                      onClick={() => handleRemoveMarketplace(marketplace)}
                    >
                      <MarketplaceIcon
                        marketplace={marketplace}
                        showTooltip={false}
                        className="w-4 h-4"
                      />
                      <span className="text-xs">{marketplace}</span>
                      {isMarkedForRemoval ? (
                        <X className="w-3 h-3" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-3 h-3 p-0 hover:bg-destructive/20 hover:text-destructive ml-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMarketplace(marketplace);
                          }}
                        >
                          <X className="w-2.5 h-2.5" />
                        </Button>
                      )}
                    </Badge>
                  );
                })}
              </HStack>
              {marketplacesToRemove.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-destructive">
                    {marketplacesToRemove.length}
                  </span>{" "}
                  marketplace{marketplacesToRemove.length !== 1 ? "s" : ""}{" "}
                  marked for removal. Click again to undo.
                </p>
              )}
            </div>
          )}
        </VStack>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || isLoading}
            variant={
              marketplacesToRemove.length > 0 ? "destructive" : "default"
            }
          >
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                {selectedMarketplaces.length > 0 &&
                marketplacesToRemove.length > 0
                  ? `Save Changes (${selectedMarketplaces.length} add, ${marketplacesToRemove.length} remove)`
                  : selectedMarketplaces.length > 0
                    ? `Add ${selectedMarketplaces.length} Marketplace${selectedMarketplaces.length !== 1 ? "s" : ""}`
                    : `Remove ${marketplacesToRemove.length} Marketplace${marketplacesToRemove.length !== 1 ? "s" : ""}`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
