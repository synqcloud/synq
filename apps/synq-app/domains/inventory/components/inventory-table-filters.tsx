"use client";

import { useEffect, useState } from "react";
import { Button, HStack, Input } from "@synq/ui/component";
import { useDebounce } from "@/shared/hooks/use-debounce";

export type StockFilterType = "all" | "in-stock" | "out-of-stock";

const STORAGE_KEY = "inventory-stock-filter";

export default function InventoryTableFilters({
  onChange,
  isLoading = false, // pass from table
  onSearchChange,
}: {
  onChange: (v: StockFilterType) => void;
  isLoading?: boolean;
  onSearchChange?: (q: string) => void;
}) {
  const [selected, setSelected] = useState<StockFilterType | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const isSearchActive = search.trim().length > 0;

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

  // Emit debounced search
  useEffect(() => {
    onSearchChange?.(debouncedSearch.trim());
  }, [debouncedSearch, onSearchChange]);

  const handleChange = (v: StockFilterType) => {
    if (isSearchActive) return; // Disable changing filter while searching
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
    <div className="flex items-center gap-2 justify-between">
      <div className="w-80 max-w-[60%]">
        <Input
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <HStack gap={1}>
        {buttons.map((b) => (
          <Button
            key={b}
            onClick={() => handleChange(b)}
            size="sm"
            variant={selected === b ? "default" : "outline"}
            disabled={isLoading || isSearchActive}
            className="text-xs font-light tracking-[-0.01em]"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                selected === b ? "bg-primary-foreground" : colors[b]
              }`}
            />
            {b === "all"
              ? "All"
              : b === "in-stock"
                ? "In Stock"
                : "Out of Stock"}
          </Button>
        ))}
      </HStack>
    </div>
  );
}
