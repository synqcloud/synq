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
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
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
          <FieldGroup>
            {/* Quantity and Condition Row */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={editData.quantity}
                  onChange={(e) =>
                    onFieldChange("quantity", parseInt(e.target.value) || 0)
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="condition">Condition</FieldLabel>
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
              </Field>
            </div>

            {/* Cost and Language Row */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="cogs">Cost (COGS)</FieldLabel>
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
              </Field>

              <Field>
                <FieldLabel htmlFor="language">Language</FieldLabel>
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
              </Field>
            </div>

            {/* SKU and Location Row */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="sku">SKU</FieldLabel>
                <Input
                  id="sku"
                  value={editData.sku || ""}
                  onChange={(e) => onFieldChange("sku", e.target.value)}
                  placeholder="Enter SKU"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input
                  id="location"
                  value={editData.location || ""}
                  onChange={(e) => onFieldChange("location", e.target.value)}
                  placeholder="Enter location"
                />
              </Field>
            </div>

            {/* Marketplaces */}
            <Field>
              <FieldLabel>Marketplaces</FieldLabel>
              <FieldDescription>
                Manage which marketplaces this stock is available on
              </FieldDescription>
              <TooltipProvider delayDuration={0}>
                <div className="flex items-center gap-2 flex-wrap">
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
                </div>
              </TooltipProvider>
            </Field>
          </FieldGroup>
        </div>

        <SheetFooter>
          <div className="flex gap-2 w-full">
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
          </div>
        </SheetFooter>
      </SheetContentConstrained>
    </Sheet>
  );
}
