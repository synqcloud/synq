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
          <VStack gap={3}>
            {/* Quantity and Condition Row */}
            <HStack gap={3}>
              <VStack gap={1} className="flex-1">
                <Label htmlFor="quantity" className="text-xs font-medium">
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
                  className="h-9"
                />
              </VStack>

              <VStack gap={1} className="flex-1">
                <Label htmlFor="condition" className="text-xs font-medium">
                  Condition
                </Label>
                <Select
                  value={editData.condition || ""}
                  onValueChange={(val) => onFieldChange("condition", val)}
                >
                  <SelectTrigger id="condition" className="h-9">
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
            </HStack>

            {/* Cost and Language Row */}
            <HStack gap={3}>
              <VStack gap={1} className="flex-1">
                <Label htmlFor="cogs" className="text-xs font-medium">
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
                  className="h-9"
                />
              </VStack>

              <VStack gap={1} className="flex-1">
                <Label htmlFor="language" className="text-xs font-medium">
                  Language
                </Label>
                <Select
                  value={editData.language || ""}
                  onValueChange={(val) => onFieldChange("language", val)}
                >
                  <SelectTrigger id="language" className="h-9">
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
            </HStack>

            {/* SKU and Location Row */}
            <HStack gap={3}>
              <VStack gap={1} className="flex-1">
                <Label htmlFor="sku" className="text-xs font-medium">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={editData.sku || ""}
                  onChange={(e) => onFieldChange("sku", e.target.value)}
                  placeholder="Enter SKU"
                  className="h-9"
                />
              </VStack>

              <VStack gap={1} className="flex-1">
                <Label htmlFor="location" className="text-xs font-medium">
                  Location
                </Label>
                <Input
                  id="location"
                  value={editData.location || ""}
                  onChange={(e) => onFieldChange("location", e.target.value)}
                  placeholder="Enter location"
                  className="h-9"
                />
              </VStack>
            </HStack>

            {/* Marketplaces */}
            <VStack gap={1}>
              <Label className="text-xs font-medium">Marketplaces</Label>
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
                    <span className="text-muted-foreground text-xs">
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
