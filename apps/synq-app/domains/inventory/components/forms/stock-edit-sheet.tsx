import React from "react";
import {
  Sheet,
  SheetContentConstrained,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  VStack,
  HStack,
  Label,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@synq/ui/component";
import { Check, X, Plus } from "lucide-react";
import { MarketplaceIcon } from "@/shared/icons/marketplace-icon";
import { EditData } from "@/features/inventory/hooks/use-stock-edit";

type StockEditSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData: EditData;
  conditions: string[];
  languages: string[];
  onFieldChange: (field: keyof EditData, value: string | number) => void;
  marketplaces: string[];
  onOpenMarketplaceDialog: () => void;
  onSave: () => void;
  onCancel: () => void;
  hasChanges: boolean;
  container?: HTMLElement | null;
};

export function StockEditSheet({
  open,
  onOpenChange,
  editData,
  conditions,
  languages,
  onFieldChange,
  marketplaces,
  onOpenMarketplaceDialog,
  onSave,
  onCancel,
  hasChanges,
  container,
}: StockEditSheetProps) {
  const handleSave = () => {
    onSave();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContentConstrained
        side="right"
        container={container}
        className="overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Edit Stock</SheetTitle>
          <SheetDescription>
            Update the stock information below
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <VStack gap={4}>
            {/* Quantity */}
            <VStack gap={2}>
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={editData.quantity}
                onChange={(e) =>
                  onFieldChange("quantity", parseInt(e.target.value) || 0)
                }
              />
            </VStack>

            {/* Condition */}
            <VStack gap={2}>
              <Label htmlFor="condition" className="text-sm font-medium">
                Condition
              </Label>
              <Select
                value={editData.condition || ""}
                onValueChange={(val) => onFieldChange("condition", val)}
              >
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </VStack>

            {/* Cost (COGS) */}
            <VStack gap={2}>
              <Label htmlFor="cogs" className="text-sm font-medium">
                Cost (COGS)
              </Label>
              <Input
                id="cogs"
                type="number"
                step={0.01}
                min={0}
                value={editData.cogs || ""}
                onChange={(e) =>
                  onFieldChange("cogs", parseFloat(e.target.value) || 0)
                }
              />
            </VStack>

            {/* SKU */}
            <VStack gap={2}>
              <Label htmlFor="sku" className="text-sm font-medium">
                SKU
              </Label>
              <Input
                id="sku"
                value={editData.sku || ""}
                onChange={(e) => onFieldChange("sku", e.target.value)}
                placeholder="Enter SKU"
              />
            </VStack>

            {/* Location */}
            <VStack gap={2}>
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                value={editData.location || ""}
                onChange={(e) => onFieldChange("location", e.target.value)}
                placeholder="Enter location"
              />
            </VStack>

            {/* Language */}
            <VStack gap={2}>
              <Label htmlFor="language" className="text-sm font-medium">
                Language
              </Label>
              <Select
                value={editData.language || ""}
                onValueChange={(val) => onFieldChange("language", val)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </VStack>

            {/* Marketplaces */}
            <VStack gap={2}>
              <Label className="text-sm font-medium">Marketplaces</Label>
              <TooltipProvider delayDuration={0}>
                <HStack gap={2} align="center" wrap="wrap">
                  {marketplaces.length > 0 ? (
                    <>
                      {marketplaces.map((mp: string) => (
                        <MarketplaceIcon
                          key={mp}
                          marketplace={mp}
                          showTooltip={true}
                        />
                      ))}
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No marketplaces added
                    </span>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 border-dashed hover:border-primary/50 hover:bg-primary/5"
                        onClick={onOpenMarketplaceDialog}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Add marketplace
                    </TooltipContent>
                  </Tooltip>
                </HStack>
              </TooltipProvider>
            </VStack>
          </VStack>
        </div>

        <SheetFooter>
          <HStack gap={2} className="w-full">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={!hasChanges}
            >
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </HStack>
        </SheetFooter>
      </SheetContentConstrained>
    </Sheet>
  );
}
