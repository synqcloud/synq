"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Filter,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Search,
  Siren,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Button,
} from "@synq/ui/component";

// Enhanced data structure with stock details
interface StockDetail {
  id: string;
  condition: string;
  quantity: number;
  grading?: string;
  cogs?: number;
  sku?: string;
  location: string;
  estimatedValue: number;
  lastUpdated: string;
}

interface InventoryItem {
  id: string;
  game: string;
  set: string;
  cardName: string;
  rarity: string;
  totalQuantity: number;
  totalStockQuantity: number;
  averageValue: number;
  lastUpdated: string;
  stockDetails: StockDetail[];
}

// Type for filters with string keys and unknown values
type Filters = Record<string, string>;

// Type for grouped data structure
interface GroupData {
  key: string;
  name: string;
  level: number;
  items: InventoryItem[];
  children: GroupData[];
  totalValue: number;
  totalStockQuantity: number;
}

// Type for internal grouping structure
interface GroupMapItem {
  key: string;
  name: string;
  level: number;
  items: InventoryItem[];
  children: Map<string, GroupMapItem>;
  totalValue: number;
  totalStockQuantity: number;
}

const mockData: InventoryItem[] = [
  {
    id: "1",
    game: "Disney Lorcana",
    set: "The First Chapter",
    cardName: "Mickey Mouse - Brave Little Tailor",
    rarity: "Legendary",
    totalQuantity: 3,
    totalStockQuantity: 2,
    averageValue: 42.5,
    lastUpdated: "2024-01-15",
    stockDetails: [
      {
        id: "1a",
        condition: "Near Mint",
        quantity: 2,
        grading: "PSA 9",
        cogs: 35.0,
        sku: "LOR-001-NM-PSA9",
        location: "Binder A - Page 1",
        estimatedValue: 45.0,
        lastUpdated: "2024-01-15",
      },
      {
        id: "1b",
        condition: "Lightly Played",
        quantity: 1,
        cogs: 25.0,
        sku: "LOR-001-LP",
        location: "Binder A - Page 1",
        estimatedValue: 35.0,
        lastUpdated: "2024-01-10",
      },
    ],
  },
  {
    id: "2",
    game: "Disney Lorcana",
    set: "The First Chapter",
    cardName: "Elsa - Snow Queen",
    rarity: "Super Rare",
    totalQuantity: 1,
    totalStockQuantity: 0, // Sold out
    averageValue: 28.5,
    lastUpdated: "2024-01-10",
    stockDetails: [
      {
        id: "2a",
        condition: "Near Mint",
        quantity: 0, // Sold out
        cogs: 20.0,
        sku: "LOR-002-NM",
        location: "Binder A - Page 2",
        estimatedValue: 28.5,
        lastUpdated: "2024-01-10",
      },
    ],
  },
  {
    id: "3",
    game: "Disney Lorcana",
    set: "Rise of the Floodborn",
    cardName: "Belle - Strange but Special",
    rarity: "Legendary",
    totalQuantity: 2,
    totalStockQuantity: 2,
    averageValue: 50.0,
    lastUpdated: "2024-01-14",
    stockDetails: [
      {
        id: "3a",
        condition: "Near Mint",
        quantity: 1,
        grading: "BGS 9.5",
        location: "Binder B - Page 1",
        estimatedValue: 52.0,
        lastUpdated: "2024-01-14",
      },
      {
        id: "3b",
        condition: "Near Mint",
        quantity: 1,
        location: "Binder B - Page 1",
        estimatedValue: 48.0,
        lastUpdated: "2024-01-12",
      },
    ],
  },
  {
    id: "4",
    game: "Pokemon TCG",
    set: "Base Set",
    cardName: "Charizard",
    rarity: "Holo Rare",
    totalQuantity: 2,
    totalStockQuantity: 0, // Sold out
    averageValue: 325.0,
    lastUpdated: "2024-01-16",
    stockDetails: [
      {
        id: "4a",
        condition: "Near Mint",
        quantity: 0, // Sold out
        grading: "PSA 8",
        cogs: 350.0,
        location: "Pokemon Binder - Page 1",
        estimatedValue: 350.0,
        lastUpdated: "2024-01-16",
      },
      {
        id: "4b",
        condition: "Lightly Played",
        quantity: 0, // Sold out
        location: "Pokemon Binder - Page 1",
        estimatedValue: 300.0,
        lastUpdated: "2024-01-15",
      },
    ],
  },
  {
    id: "5",
    game: "Pokemon TCG",
    set: "Base Set",
    cardName: "Blastoise",
    rarity: "Holo Rare",
    totalQuantity: 1,
    totalStockQuantity: 1,
    averageValue: 120.0,
    lastUpdated: "2024-01-16",
    stockDetails: [
      {
        id: "5a",
        condition: "Lightly Played",
        quantity: 1,
        location: "Pokemon Binder - Page 2",
        estimatedValue: 120.0,
        lastUpdated: "2024-01-16",
      },
    ],
  },
  {
    id: "6",
    game: "Magic: The Gathering",
    set: "Dominaria",
    cardName: "Teferi, Hero of Dominaria",
    rarity: "Mythic Rare",
    totalQuantity: 1,
    totalStockQuantity: 0, // Sold out
    averageValue: 45.0,
    lastUpdated: "2024-01-12",
    stockDetails: [
      {
        id: "6a",
        condition: "Near Mint",
        quantity: 0, // Sold out
        location: "MTG Binder - Page 1",
        estimatedValue: 45.0,
        lastUpdated: "2024-01-12",
      },
    ],
  },
  {
    id: "7",
    game: "Magic: The Gathering",
    set: "Dominaria",
    cardName: "Karn, Scion of Urza",
    rarity: "Mythic Rare",
    totalQuantity: 2,
    totalStockQuantity: 2,
    averageValue: 35.0,
    lastUpdated: "2024-01-13",
    stockDetails: [
      {
        id: "7a",
        condition: "Near Mint",
        quantity: 1,
        location: "MTG Binder - Page 2",
        estimatedValue: 38.0,
        lastUpdated: "2024-01-13",
      },
      {
        id: "7b",
        condition: "Lightly Played",
        quantity: 1,
        location: "MTG Binder - Page 2",
        estimatedValue: 32.0,
        lastUpdated: "2024-01-13",
      },
    ],
  },
  {
    id: "8",
    game: "Yu-Gi-Oh!",
    set: "Legend of Blue Eyes White Dragon",
    cardName: "Blue-Eyes White Dragon",
    rarity: "Ultra Rare",
    totalQuantity: 1,
    totalStockQuantity: 0, // Sold out
    averageValue: 85.0,
    lastUpdated: "2024-01-11",
    stockDetails: [
      {
        id: "8a",
        condition: "Near Mint",
        quantity: 0, // Sold out
        location: "Yu-Gi-Oh Binder - Page 1",
        estimatedValue: 85.0,
        lastUpdated: "2024-01-11",
      },
    ],
  },
];

const groupFields = [
  { field: "game", label: "Game" },
  { field: "set", label: "Set" },
  { field: "rarity", label: "Rarity" },
] as const;

export default function InventoryTable() {
  const [groupBy, setGroupBy] = useState<string[]>(["game", "set"]);
  const [filters, setFilters] = useState<Filters>({});
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["Disney Lorcana", "Pokemon TCG"]),
  );
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [stockFilter, setStockFilter] = useState<
    "all" | "in-stock" | "out-of-stock"
  >("all");

  // Optimized filtering with early returns
  const filteredData = useMemo(() => {
    let data = mockData;

    // Apply stock filter first
    switch (stockFilter) {
      case "in-stock":
        data = data.filter((item) => item.totalStockQuantity > 0);
        break;
      case "out-of-stock":
        data = data.filter((item) => item.totalStockQuantity === 0);
        break;
      case "all":
      default:
        // Show all items
        break;
    }

    // Apply text filters
    const activeFilters = Object.entries(filters).filter(([, value]) => value);
    if (activeFilters.length === 0) return data;

    return data.filter((item) =>
      activeFilters.every(([field, filterValue]) =>
        String(item[field as keyof InventoryItem])
          .toLowerCase()
          .includes((filterValue as string).toLowerCase()),
      ),
    );
  }, [filters, stockFilter]);

  // Simplified grouping - single pass through data
  const groups = useMemo<GroupData[]>(() => {
    // If no group by options are selected, default to grouping by card name
    const effectiveGroupBy = groupBy.length === 0 ? ["cardName"] : groupBy;

    const groupMap = new Map<string, GroupMapItem>();

    filteredData.forEach((item) => {
      let path = "";
      let currentMap = groupMap;

      effectiveGroupBy.forEach((field, index) => {
        const value = item[field as keyof InventoryItem];
        path = path ? `${path}/${value}` : String(value);

        if (!currentMap.has(String(value))) {
          currentMap.set(String(value), {
            key: path,
            name: String(value),
            level: index,
            items: [],
            children: new Map(),
            totalValue: 0,
            totalStockQuantity: 0,
          });
        }

        const group = currentMap.get(String(value))!;
        // Calculate total value from actual stock details
        const itemTotalValue = item.stockDetails.reduce(
          (sum, detail) => sum + detail.estimatedValue * detail.quantity,
          0,
        );
        group.totalValue += itemTotalValue;
        group.totalStockQuantity += item.totalStockQuantity;

        if (index === effectiveGroupBy.length - 1) {
          group.items.push(item);
        }

        currentMap = group.children;
      });
    });

    // Convert Maps to arrays for rendering
    const convertToArray = (map: Map<string, GroupMapItem>): GroupData[] =>
      Array.from(map.values()).map((group: GroupMapItem) => ({
        ...group,
        children: convertToArray(group.children),
      }));

    return convertToArray(groupMap);
  }, [filteredData, groupBy]);

  // Memoized callbacks
  const toggleGroup = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const toggleCard = useCallback((cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  const updateFilter = useCallback((field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleGroupBy = useCallback((field: string) => {
    setGroupBy((prev) => {
      let newGroupBy;
      if (prev.includes(field)) {
        newGroupBy = prev.filter((f) => f !== field);
      } else {
        newGroupBy = [...prev, field];
      }

      // Define the hierarchy order
      const hierarchy = ["game", "set", "rarity", "cardName"];

      // Get all fields that are in the hierarchy and are currently selected
      const selectedHierarchyFields = hierarchy.filter((field) =>
        newGroupBy.includes(field),
      );

      if (selectedHierarchyFields.length > 1) {
        // Remove all hierarchy fields first
        const otherFields = newGroupBy.filter((f) => !hierarchy.includes(f));

        // Find the earliest position where any of the selected hierarchy fields appeared
        const positions = selectedHierarchyFields.map((field) =>
          prev.indexOf(field),
        );
        const earliestPos = Math.min(
          ...positions.map((pos) => (pos === -1 ? Infinity : pos)),
        );

        // Insert hierarchy fields in correct order at the earliest position
        const insertPos =
          earliestPos === Infinity
            ? otherFields.length
            : Math.min(earliestPos, otherFields.length);
        return [
          ...otherFields.slice(0, insertPos),
          ...selectedHierarchyFields,
          ...otherFields.slice(insertPos),
        ];
      }

      return newGroupBy;
    });
  }, []);

  // Optimized condition styling
  const conditionColors: Record<string, string> = {
    "near mint": "text-green-600",
    "lightly played": "text-yellow-600",
    played: "text-red-600",
  };

  // Helper function to determine if item is out of stock
  const isOutOfStock = (item: InventoryItem) => item.totalStockQuantity === 0;

  // Stock Detail Component
  const StockDetailRenderer: React.FC<{
    detail: StockDetail;
    depth: number;
  }> = ({ detail, depth }) => (
    <div className="bg-background">
      {/* Desktop Stock Detail Row */}
      <div className="hidden md:block">
        <div
          className="px-4 py-2 border-b border-border hover:bg-accent"
          style={{ paddingLeft: `${64 + depth * 24}px` }}
        >
          <div className="grid grid-cols-9 gap-4 text-sm">
            <span className="font-medium">{detail.quantity}</span>
            <span
              className={conditionColors[detail.condition.toLowerCase()] || ""}
            >
              {detail.condition}
            </span>
            <span className="text-primary">{detail.grading || "-"}</span>
            <span className="text-accent-foreground">
              {detail.cogs ? `$${detail.cogs.toFixed(2)}` : "-"}
            </span>
            <span className="text-foreground">{detail.sku || "-"}</span>
            <span className="text-foreground">{detail.location}</span>
            <span className="font-medium text-green-600">
              ${detail.estimatedValue.toFixed(2)}
            </span>
            <span className="text-foreground text-xs">
              {detail.lastUpdated}
            </span>
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex items-center justify-center w-8 h-8 hover:bg-accent rounded transition-colors"
                      onClick={() => console.log("Add to cart:", detail.id)}
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add to cart</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="flex items-center justify-center w-8 h-8 hover:bg-accent rounded transition-colors"
                      onClick={() =>
                        window.open("/inventory/item/mockitem", "_blank")
                      }
                      aria-label="See card"
                    >
                      <Search className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View card details</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex items-center justify-center w-8 h-8 hover:bg-accent rounded transition-colors"
                      onClick={() => console.log("Set alert:", detail.id)}
                      aria-label="Set alert"
                    >
                      <Siren className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set price alert</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Stock Detail Card */}
      <div className="md:hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg">{detail.quantity}</span>
              <span
                className={`text-sm font-medium ${conditionColors[detail.condition.toLowerCase()] || ""}`}
              >
                {detail.condition}
              </span>
              {detail.grading && (
                <span className="text-xs text-primary">{detail.grading}</span>
              )}
              {detail.cogs && (
                <span className="text-xs text-accent-foreground">
                  ${detail.cogs.toFixed(2)}
                </span>
              )}
              {detail.sku && (
                <span className="text-xs text-muted-foreground">
                  {detail.sku}
                </span>
              )}
            </div>
            <span className="font-medium text-green-600">
              ${detail.estimatedValue.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-foreground">
            <span>{detail.location}</span>
            <span>{detail.lastUpdated}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-foreground">{detail.lastUpdated}</div>
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex items-center justify-center w-6 h-6 hover:bg-accent rounded transition-colors"
                      onClick={() => console.log("Add to cart:", detail.id)}
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-3 h-3 text-muted-foreground hover:text-primary" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add to cart</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="flex items-center justify-center w-6 h-6 hover:bg-accent rounded transition-colors"
                      onClick={() =>
                        window.open("/inventory/item/mockitem", "_blank")
                      }
                      aria-label="See card"
                    >
                      <Search className="w-3 h-3 text-muted-foreground hover:text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View card details</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex items-center justify-center w-6 h-6 hover:bg-accent rounded transition-colors"
                      onClick={() => console.log("Set alert:", detail.id)}
                      aria-label="Set alert"
                    >
                      <Siren className="w-3 h-3 text-muted-foreground hover:text-primary" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set price alert</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Card Component (now follows collapsible pattern)
  const CardRenderer: React.FC<{ item: InventoryItem; depth: number }> = ({
    item,
    depth,
  }) => {
    const isExpanded = expandedCards.has(item.id);
    const totalValue = item.stockDetails.reduce(
      (sum, detail) => sum + detail.estimatedValue * detail.quantity,
      0,
    );

    return (
      <div key={item.id}>
        {/* Card Header (collapsible like groups) */}
        <div
          className={`flex items-center px-4 py-2 cursor-pointer hover:bg-accent border-l-2 ${
            isOutOfStock(item)
              ? "bg-muted/30 opacity-60 border-muted"
              : "bg-accent/50 border-primary"
          }`}
          style={{ paddingLeft: `${16 + depth * 24}px` }}
          onClick={() => toggleCard(item.id)}
        >
          {item.stockDetails.length > 0 ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )
          ) : (
            <div className="w-6" />
          )}

          <span
            className={`flex-1 font-light tracking-[-0.01em] ${isOutOfStock(item) ? "text-muted-foreground" : ""}`}
          >
            {item.cardName} ({item.stockDetails.length})
            {isOutOfStock(item) && (
              <span className="text-xs text-red-500 ml-2">(Out of Stock)</span>
            )}
          </span>
          <div className="flex gap-4 text-sm font-light tracking-[-0.01em] text-foreground">
            <span className="hidden sm:inline">{item.rarity}</span>
            <span className={isOutOfStock(item) ? "text-red-500" : ""}>
              Qty: {item.totalStockQuantity || 0}
            </span>
            <span
              className={`font-medium ${isOutOfStock(item) ? "text-muted-foreground" : ""}`}
            >
              ${totalValue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Expanded Stock Details */}
        {isExpanded && item.stockDetails.length > 0 && (
          <div className="bg-background">
            {/* Desktop Headers for Stock Details */}
            <div
              className="hidden md:block px-4 py-2 bg-muted text-sm font-medium text-muted-foreground border-b"
              style={{ paddingLeft: `${64 + depth * 24}px` }}
            >
              <div className="grid grid-cols-9 gap-4">
                <span>Qty</span>
                <span>Condition</span>
                <span>Grading</span>
                <span title="Cost of Goods Sold - what you paid for the card">
                  Cost (COGS)
                </span>
                <span>SKU</span>
                <span>Location</span>
                <span>Value</span>
                <span>Updated</span>
                <span>Actions</span>
              </div>
            </div>

            {/* Stock Details */}
            {item.stockDetails.map((detail: StockDetail) => (
              <StockDetailRenderer
                key={detail.id}
                detail={detail}
                depth={depth}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Recursive group renderer
  const GroupRenderer: React.FC<{ group: GroupData; depth?: number }> = ({
    group,
    depth = 0,
  }) => {
    const isExpanded = expanded.has(group.key);

    // Recursively count all items in this group and all descendants
    const countAllItems = (grp: GroupData): number => {
      let count = grp.items.length;
      grp.children.forEach((child: GroupData) => {
        count += countAllItems(child);
      });
      return count;
    };

    // Recursively count stock items in this group and all descendants
    const countStockItems = (grp: GroupData): number => {
      let count = grp.items.filter(
        (item) => item.totalStockQuantity > 0,
      ).length;
      grp.children.forEach((child: GroupData) => {
        count += countStockItems(child);
      });
      return count;
    };

    const itemCount = countAllItems(group);
    const stockItemCount = countStockItems(group);

    return (
      <div key={group.key}>
        {/* Group Header */}
        <div
          className={`flex items-center px-4 py-2 cursor-pointer hover:bg-accent ${
            depth === 0
              ? "bg-muted font-light tracking-[-0.01em]"
              : "bg-accent font-light tracking-[-0.01em]"
          }`}
          style={{ paddingLeft: `${16 + depth * 24}px` }}
          onClick={() => toggleGroup(group.key)}
        >
          {group.children.length > 0 || group.items.length > 0 ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )
          ) : (
            <div className="w-6" />
          )}

          <span className="flex-1">
            {group.name} ({stockItemCount})
          </span>
          <div className="flex gap-4 text-sm font-light tracking-[-0.01em] text-foreground">
            <span className="font-medium">${group.totalValue.toFixed(2)}</span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <>
            {/* Child Groups */}
            {group.children.map((child: GroupData) => (
              <GroupRenderer key={child.key} group={child} depth={depth + 1} />
            ))}

            {/* Cards (now collapsible) */}
            {group.items.map((item: InventoryItem) => (
              <CardRenderer key={item.id} item={item} depth={depth + 1} />
            ))}
          </>
        )}
      </div>
    );
  };

  const totals = useMemo(
    () => ({
      items: filteredData.length,
      quantity: filteredData.reduce((sum, item) => sum + item.totalQuantity, 0),
      value: filteredData.reduce((sum, item) => {
        // Calculate total value from actual stock details
        const itemTotalValue = item.stockDetails.reduce(
          (detailSum, detail) =>
            detailSum + detail.estimatedValue * detail.quantity,
          0,
        );
        return sum + itemTotalValue;
      }, 0),
      stockItems: mockData.filter((item) => item.totalStockQuantity > 0).length,
      outOfStockItems: mockData.filter((item) => item.totalStockQuantity === 0)
        .length,
      totalItems: mockData.length,
    }),
    [filteredData],
  );

  return (
    <div className="w-full h-full bg-background flex flex-col">
      {/* Bulk Management - Hidden for now */}
      {/* <div className="p-4 bg-background border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-light tracking-[-0.01em] text-foreground">Bulk Management</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-light tracking-[-0.01em] bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
              Import CSV
            </button>
            <button className="px-3 py-1.5 text-xs font-light tracking-[-0.01em] bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors">
              Export CSV
            </button>
            <button className="px-3 py-1.5 text-xs font-light tracking-[-0.01em] bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors">
              Quick Add
            </button>
          </div>
        </div>
      </div> */}

      {/* Group Controls */}
      <div className="p-4 bg-muted border-b">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-light tracking-[-0.01em]">
            Group by:
          </span>
          <div className="flex gap-1">
            {groupBy.length === 0 ? (
              <span className="text-xs font-light tracking-[-0.01em] text-foreground">
                Card Name
              </span>
            ) : (
              groupBy.map((field, i) => (
                <React.Fragment key={field}>
                  {i > 0 && (
                    <ChevronRight className="w-3 h-3 text-foreground" />
                  )}
                  <span className="text-xs font-light tracking-[-0.01em] text-foreground capitalize">
                    {field}
                  </span>
                </React.Fragment>
              ))
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {groupFields.map(({ field, label }) => (
              <button
                key={field}
                onClick={() => toggleGroupBy(field)}
                className={`px-3 py-1 rounded text-xs font-light tracking-[-0.01em] transition-colors ${
                  groupBy.includes(field)
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-accent border"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Stock Filter Buttons */}
          <div className="flex gap-1">
            <Button
              onClick={() => setStockFilter("all")}
              variant={stockFilter === "all" ? "default" : "outline"}
              size="sm"
              className="text-xs font-light tracking-[-0.01em]"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  stockFilter === "all" ? "bg-primary-foreground" : "bg-primary"
                }`}
              />
              All
            </Button>
            <Button
              onClick={() => setStockFilter("in-stock")}
              variant={stockFilter === "in-stock" ? "default" : "outline"}
              size="sm"
              className="text-xs font-light tracking-[-0.01em]"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  stockFilter === "in-stock"
                    ? "bg-primary-foreground"
                    : "bg-green-500"
                }`}
              />
              In Stock
            </Button>
            <Button
              onClick={() => setStockFilter("out-of-stock")}
              variant={stockFilter === "out-of-stock" ? "default" : "outline"}
              size="sm"
              className="text-xs font-light tracking-[-0.01em]"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  stockFilter === "out-of-stock"
                    ? "bg-primary-foreground"
                    : "bg-red-500"
                }`}
              />
              Out of Stock
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-background border-b">
        <div className="flex items-center justify-between mb-3 md:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-light tracking-[-0.01em]"
          >
            <Filter className="w-4 h-4" />
            Filters
            {Object.values(filters).some(Boolean) && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
        </div>

        <div className={`${showFilters ? "block" : "hidden"} md:block`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {["game", "set", "rarity", "cardName"].map((field) => (
              <div key={field}>
                <label className="block text-xs font-light tracking-[-0.01em] text-foreground capitalize mb-1">
                  {field === "cardName" ? "Card Name" : field}
                </label>
                <input
                  type="text"
                  placeholder={`Filter ${field === "cardName" ? "card name" : field}...`}
                  value={filters[field] || ""}
                  onChange={(e) => updateFilter(field, e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="flex-1 overflow-auto">
        {groups.length > 0 ? (
          groups.map((group: GroupData) => (
            <GroupRenderer key={group.key} group={group} />
          ))
        ) : (
          <div className="p-8 text-center text-foreground">
            {groupBy.length === 0
              ? "Select grouping options above"
              : "No items match filters"}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 bg-muted border-t text-sm font-light tracking-[-0.01em]">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <span>Items: {totals.items}</span>
            {stockFilter === "in-stock" && (
              <span className="text-green-600">
                In Stock: {totals.stockItems}/{totals.totalItems}
              </span>
            )}
            {stockFilter === "out-of-stock" && (
              <span className="text-red-600">
                Out of Stock: {totals.outOfStockItems}/{totals.totalItems}
              </span>
            )}
            {stockFilter === "all" && (
              <span className="text-blue-600">
                Total: {totals.totalItems} items
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <span>
              Stock Qty:{" "}
              {filteredData.reduce(
                (sum, item) => sum + item.totalStockQuantity,
                0,
              )}
            </span>
            <span className="font-medium">
              Value: ${totals.value.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
