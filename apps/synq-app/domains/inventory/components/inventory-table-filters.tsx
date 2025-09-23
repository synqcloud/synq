"use client";

import { useEffect, useState } from "react";
import { Button } from "@synq/ui/component";

export type StockFilterType = "all" | "in-stock" | "out-of-stock";

const STORAGE_KEY = "inventory-stock-filter";

export default function InventoryTableFilters({
  onChange,
  isLoading = false, // pass from table
}: {
  onChange: (v: StockFilterType) => void;
  isLoading?: boolean;
}) {
  const [selected, setSelected] = useState<StockFilterType | null>(null);

  // Load saved filter from localStorage on mount
  useEffect(() => {
    let mounted = false;
    if (!mounted) {
      const saved = localStorage.getItem(STORAGE_KEY) as StockFilterType | null;
      const initial = saved || "all";
      setSelected(initial);
      onChange(initial);
      mounted = true;
    }
  }, [onChange]);

  const handleChange = (v: StockFilterType) => {
    setSelected(v);
    localStorage.setItem(STORAGE_KEY, v);
    onChange(v);
  };

  const buttons: StockFilterType[] = ["all", "in-stock", "out-of-stock"];
  const colors = {
    all: "bg-primary",
    "in-stock": "bg-green-500",
    "out-of-stock": "bg-red-500",
  };

  return (
    <div className="flex gap-1 justify-end">
      {buttons.map((b) => (
        <Button
          key={b}
          onClick={() => handleChange(b)}
          size="sm"
          variant={selected === b ? "default" : "outline"}
          disabled={isLoading}
          className="text-xs font-light tracking-[-0.01em]"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              selected === b ? "bg-primary-foreground" : colors[b]
            }`}
          />
          {b === "all" ? "All" : b === "in-stock" ? "In Stock" : "Out of Stock"}
        </Button>
      ))}
    </div>
  );
}
