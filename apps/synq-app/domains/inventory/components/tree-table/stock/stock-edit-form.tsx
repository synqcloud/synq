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
} from "@synq/ui/component";
import { Check, X } from "lucide-react";
import { EditData } from "@/features/inventory/hooks/use-stock-edit";
import { MarketplaceSection } from "../marketplace/marketplace-section";

type StockEditFormProps = {
  editData: EditData;
  conditions: string[];
  languages: string[];
  onFieldChange: (field: keyof EditData, value: string | number) => void;
  marketplaces: string[];
  onOpenDialog: () => void;
  onSave: () => void;
  onCancel: () => void;
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
          value={editData.cogs || ""}
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
        <MarketplaceSection
          marketplaces={marketplaces}
          onOpenDialog={onOpenDialog}
          isEditing={true}
        />
        {/* Actions */}
        <HStack gap={1}>
          <Button size="icon" variant="outline" onClick={onSave}>
            <Check className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </HStack>
      </div>

      {/* Mobile View - Stacked Layout */}
      <div className="block md:hidden space-y-4">
        {/* First row: Quantity, Condition, Cost */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">
              Qty
            </label>
            <Input
              type="number"
              min={1}
              value={editData.quantity}
              onChange={(e) =>
                onFieldChange("quantity", parseInt(e.target.value) || 1)
              }
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">
              Condition
            </label>
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
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">
              Cost
            </label>
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
          </div>
        </div>

        {/* Second row: SKU, Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">
              SKU
            </label>
            <Input
              value={editData.sku || ""}
              onChange={(e) => onFieldChange("sku", e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">
              Location
            </label>
            <Input
              value={editData.location || ""}
              onChange={(e) => onFieldChange("location", e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Third row: Language (full width) */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1">
            Language
          </label>
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
        </div>

        {/* Fourth row: Marketplaces */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
            Marketplaces
          </label>
          <div className="flex items-center gap-2">
            {marketplaces.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {marketplaces.map((marketplace) => (
                  <span
                    key={marketplace}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                  >
                    {marketplace}
                  </span>
                ))}
              </div>
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={onSave} className="flex-1 sm:flex-none">
            <Check className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </>
  );
}
