// FIXME: This component needs refactoring
import React from "react";
import {
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  HStack,
  VStack,
  Label,
} from "@synq/ui/component";
import { Check, X, Plus } from "lucide-react";
import { EditData } from "@/features/inventory/hooks/use-stock-edit";
import { MarketplaceDisplay } from "../tree-table/stock-row/marketplace/marketplace-display";

type StockEditFormProps = {
  editData: EditData;
  conditions: string[];
  languages: string[];
  onFieldChange: (field: keyof EditData, value: string | number) => void;
  marketplaces: string[];
  onOpenDialog: () => void;
  onSave: () => void;
  onCancel: () => void;
  hasChanges: boolean;
};

export function StockEditForm({
  editData,
  conditions,
  languages,
  onFieldChange,
  marketplaces,
  onOpenDialog,
  onSave,
  onCancel,
  hasChanges,
}: StockEditFormProps) {
  return (
    <>
      {/* Desktop View - Grid Layout */}
      <div className="hidden md:contents">
        {/* Quantity */}
        <Input
          type="number"
          min={1}
          value={editData.quantity}
          onChange={(e) =>
            onFieldChange("quantity", parseInt(e.target.value) || 1)
          }
        />
        {/* Condition */}
        <Select
          value={editData.condition || ""}
          onValueChange={(val) => onFieldChange("condition", val)}
        >
          <SelectTrigger>
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
        {/* Cost (COGS) */}
        <Input
          type="number"
          step={0.01}
          min={0}
          value={editData.cogs || 0}
          onChange={(e) =>
            onFieldChange("cogs", parseFloat(e.target.value) || 0)
          }
        />
        {/* SKU */}
        <Input
          value={editData.sku || ""}
          onChange={(e) => onFieldChange("sku", e.target.value)}
        />
        {/* Location */}
        <Input
          value={editData.location || ""}
          onChange={(e) => onFieldChange("location", e.target.value)}
        />
        {/* Language */}
        <Select
          value={editData.language || ""}
          onValueChange={(val) => onFieldChange("language", val)}
        >
          <SelectTrigger>
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
        {/* Marketplaces */}
        <MarketplaceDisplay
          marketplaces={marketplaces}
          onOpenDialog={onOpenDialog}
        />
        {/* Actions */}
        <HStack gap={1}>
          <Button
            size="icon"
            variant="outline"
            onClick={onSave}
            disabled={!hasChanges}
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </HStack>
      </div>

      {/* Mobile View - Stacked Layout */}
      <VStack className="block md:hidden" gap={4}>
        {/* First row: Quantity, Condition, Cost */}
        <div className="grid grid-cols-3 gap-3">
          <VStack gap={1}>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Qty
            </Label>
            <Input
              type="number"
              min={1}
              value={editData.quantity}
              onChange={(e) =>
                onFieldChange("quantity", parseInt(e.target.value) || 1)
              }
              className="text-sm"
            />
          </VStack>
          <VStack gap={1}>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Condition
            </Label>
            <Select
              value={editData.condition || ""}
              onValueChange={(val) => onFieldChange("condition", val)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select" />
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
          <VStack gap={1}>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Cost
            </Label>
            <Input
              type="number"
              step={0.01}
              min={0}
              value={editData.cogs || ""}
              onChange={(e) =>
                onFieldChange("cogs", parseFloat(e.target.value) || 0)
              }
              className="text-sm"
            />
          </VStack>
        </div>

        {/* Second row: SKU, Location */}
        <div className="grid grid-cols-2 gap-3">
          <VStack gap={1}>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              SKU
            </Label>
            <Input
              value={editData.sku || ""}
              onChange={(e) => onFieldChange("sku", e.target.value)}
              className="text-sm"
            />
          </VStack>
          <VStack gap={1}>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Location
            </Label>
            <Input
              value={editData.location || ""}
              onChange={(e) => onFieldChange("location", e.target.value)}
              className="text-sm"
            />
          </VStack>
        </div>

        {/* Third row: Language (full width) */}
        <VStack gap={1}>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Language
          </Label>
          <Select
            value={editData.language || ""}
            onValueChange={(val) => onFieldChange("language", val)}
          >
            <SelectTrigger className="text-sm">
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

        {/* Fourth row: Marketplaces */}
        <VStack gap={2}>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Marketplaces
          </Label>
          <HStack gap={2} align="center">
            {marketplaces.length > 0 ? (
              <HStack gap={2} wrap="wrap">
                {marketplaces.map((marketplace) => (
                  <span
                    key={marketplace}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                  >
                    {marketplace}
                  </span>
                ))}
              </HStack>
            ) : (
              <span className="text-muted-foreground text-sm">
                No marketplaces
              </span>
            )}
            <Button
              size="icon"
              variant="outline"
              onClick={onOpenDialog}
              className="flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </HStack>
        </VStack>

        {/* Actions row */}
        <HStack justify="end" gap={2} className="pt-2 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="flex-1 sm:flex-none"
            disabled={!hasChanges}
          >
            <Check className="w-4 h-4 mr-2" />
            Save
          </Button>
        </HStack>
      </VStack>
    </>
  );
}
