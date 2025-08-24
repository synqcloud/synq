"use client";

// Core
import React, { useState, useMemo } from "react";
import Image from "next/image";

// Components
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Separator,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@synq/ui/component";

// Shared Components
import { CardmarketIcon, TcgplayerIcon } from "@/shared/icons/icons";

// Icons
import {
  Trash2,
  Plus,
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Edit,
  Copy,
  ExternalLink,
  BarChart3,
  X,
} from "lucide-react";

// Services
import { PublicCard } from "@synq/supabase/services";

// Mock data types
interface MockStock {
  id: string;
  condition: string;
  grade?: string;
  quantity: number;
  cogs?: number;
  certification_id?: string;
  note?: string;
  created_at: string;
}

interface MockItem {
  id: string;
  name: string;
  image_url?: string;
  rarity?: string;
  collection_id: string;
  stock?: MockStock[];
}

interface ItemEditPageProps {
  item: PublicCard;
}

const collectionRarities = [
  { name: "common", color: "#E5E7EB" },
  { name: "uncommon", color: "#A7F3D0" },
  { name: "rare", color: "#FCD34D" },
  { name: "mythic", color: "#F472B6" },
  { name: "special", color: "#8B5CF6" },
];

// Mock market data for demonstration
const mockMarketData = {
  tcgplayer: {
    price: 0.11,
    lastUpdated: "2024-01-15",
    change: "+2.5%",
    trend: "up" as const,
  },
  cardmarket: {
    price: 0.09,
    lastUpdated: "2024-01-15",
    change: "+1.8%",
    trend: "up" as const,
  },
};

function ItemEditPage({ item }: ItemEditPageProps) {
  const [showAddStockDialog, setShowAddStockDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Mock item data if not provided
  const mockItem: MockItem = item || {
    id: "mock-item-1",
    name: "Charizard VMAX",
    image_url:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=600&fit=crop",
    rarity: "rare",
    collection_id: "mock-collection-1",
    stock: [
      {
        id: "stock-1",
        condition: "mint",
        grade: "9.5",
        quantity: 2,
        cogs: 45.0,
        certification_id: "PSA-123456",
        note: "Opened from booster pack",
        created_at: "2024-01-15T10:30:00Z",
      },
      {
        id: "stock-2",
        condition: "near_mint",
        quantity: 1,
        cogs: 42.5,
        note: "Traded from friend",
        created_at: "2024-01-10T14:20:00Z",
      },
    ],
  };

  // Calculate inventory summary
  const inventorySummary = useMemo(() => {
    const stock = item.user_card_stock || [];
    const totalQuantity = stock.reduce(
      (sum: any, s: any) => sum + (s.quantity || 0),
      0,
    );
    const totalCogs = stock.reduce(
      (sum: any, s: any) => sum + (s.cogs || 0) * (s.quantity || 0),
      0,
    );
    // For now, use cogs as estimated value since we don't have that field yet
    const totalValue = stock.reduce(
      (sum: any, s: any) => sum + (s.cogs || 0) * (s.quantity || 0),
      0,
    );
    const margin =
      totalCogs > 0 ? ((totalValue - totalCogs) / totalCogs) * 100 : 0;

    return {
      totalQuantity,
      totalCogs,
      totalValue,
      margin: Math.round(margin * 10) / 10,
      lastUpdated:
        stock.length > 0
          ? new Date(
              Math.max(
                ...stock.map((s: any) =>
                  new Date(s.created_at || new Date()).getTime(),
                ),
              ),
            ).toLocaleDateString()
          : "Never",
    };
  }, [item.user_card_stock]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-light tracking-[-0.01em] text-foreground">
                  {item.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs font-light tracking-[-0.01em]"
                  >
                    {/* {mockSubCollections.find(
                      (sub) => sub.id === mockItem.collection_id
                    )?.name || "Collection"} */}
                    collection name placeholder
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs font-light tracking-[-0.01em]"
                    style={{
                      backgroundColor:
                        collectionRarities.find((r) => r.name === item.rarity)
                          ?.color + "20",
                      borderColor: collectionRarities.find(
                        (r) => r.name === item.rarity,
                      )?.color,
                      color: collectionRarities.find(
                        (r) => r.name === item.rarity,
                      )?.color,
                    }}
                  >
                    {item.rarity || "Unknown"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs font-light tracking-[-0.01em]"
                  >
                    TCG
                  </Badge>
                </div>
              </div>
            </div>

            {/* Card Image Thumbnail */}
            {item.image_url && (
              <div
                className="relative w-20 h-28 rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => setShowImageModal(true)}
              >
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <ExternalLink className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market Info Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <TcgplayerIcon className="w-4 h-4" />
                <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
                  TCGPlayer:
                </span>
                <span className="text-sm font-medium">
                  ${mockMarketData.tcgplayer.price}
                </span>
                <div className="flex items-center gap-1">
                  {mockMarketData.tcgplayer.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}

                  <span className="text-xs text-muted-foreground">
                    {mockMarketData.tcgplayer.change}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CardmarketIcon className="w-4 h-4" />
                <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
                  Cardmarket:
                </span>
                <span className="text-sm font-medium">
                  €{mockMarketData.cardmarket.price}
                </span>
                <div className="flex items-center gap-1">
                  {mockMarketData.cardmarket.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {mockMarketData.cardmarket.change}
                  </span>
                </div>
              </div>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-light tracking-[-0.01em]"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pulled from TCGPlayer, updated daily</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Inventory Table */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-light tracking-[-0.01em] text-foreground">
                Inventory
              </h2>
              <Button
                onClick={() => setShowAddStockDialog(true)}
                variant="outline"
                className="text-xs font-light tracking-[-0.01em]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-light tracking-[-0.01em]">
                        Condition
                      </TableHead>
                      <TableHead className="text-xs font-light tracking-[-0.01em]">
                        Grade
                      </TableHead>
                      <TableHead className="text-xs font-light tracking-[-0.01em]">
                        Qty
                      </TableHead>
                      <TableHead className="text-xs font-light tracking-[-0.01em]">
                        Cost
                      </TableHead>
                      <TableHead className="text-xs font-light tracking-[-0.01em]">
                        SKU
                      </TableHead>
                      <TableHead className="text-xs font-light tracking-[-0.01em]">
                        Location
                      </TableHead>
                      <TableHead className="text-xs font-light tracking-[-0.01em]">
                        Acquired
                      </TableHead>
                      <TableHead className="text-xs font-light tracking-[-0.01em]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(item.user_card_stock || []).map((stock: any) => (
                      <TableRow key={stock.id}>
                        <TableCell className="text-sm font-light tracking-[-0.01em]">
                          {stock.condition || "Unknown"}
                        </TableCell>
                        <TableCell className="text-sm font-light tracking-[-0.01em]">
                          {stock.grade || "Raw"}
                        </TableCell>
                        <TableCell className="text-sm font-light tracking-[-0.01em]">
                          {stock.quantity || 0}
                        </TableCell>
                        <TableCell className="text-sm font-light tracking-[-0.01em]">
                          {stock.cogs ? formatCurrency(stock.cogs) : "-"}
                        </TableCell>
                        <TableCell className="text-sm font-light tracking-[-0.01em]">
                          {stock.sku || "-"}
                        </TableCell>
                        <TableCell className="text-sm font-light tracking-[-0.01em]">
                          {stock.location || "-"}
                        </TableCell>
                        <TableCell className="text-sm font-light tracking-[-0.01em]">
                          {stock.notes || "-"}
                        </TableCell>
                        <TableCell className="text-sm font-light tracking-[-0.01em]">
                          {stock.created_at
                            ? new Date(stock.created_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit stock</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Duplicate stock</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete stock</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(item.user_card_stock || []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Package className="w-8 h-8 opacity-50" />
                            <p className="text-sm font-light tracking-[-0.01em]">
                              No stock entries yet
                            </p>
                            <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground">
                              Add your first stock entry to start tracking
                              inventory
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Inventory Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-light tracking-[-0.01em]">
                    Inventory Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
                      Total Quantity
                    </span>
                    <span className="text-sm font-medium">
                      {inventorySummary.totalQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
                      Total Cost
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(inventorySummary.totalCogs)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
                      Total Value
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(inventorySummary.totalValue)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
                      Est. Margin
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        inventorySummary.margin > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {inventorySummary.margin > 0 ? "+" : ""}
                      {inventorySummary.margin}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
                      Last Updated
                    </span>
                    <span className="text-sm font-light tracking-[-0.01em] text-muted-foreground">
                      {inventorySummary.lastUpdated}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-light tracking-[-0.01em]">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-light tracking-[-0.01em] justify-start"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View on TCGPlayer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-light tracking-[-0.01em] justify-start"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View on Cardmarket
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-light tracking-[-0.01em] justify-start"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View on eBay
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-light tracking-[-0.01em] justify-start"
                  >
                    <BarChart3 className="w-3 h-3 mr-2" />
                    Price History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-light tracking-[-0.01em] justify-start"
                  >
                    <Package className="w-3 h-3 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add Stock Dialog */}
      {showAddStockDialog && (
        <Dialog open={showAddStockDialog} onOpenChange={setShowAddStockDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-light tracking-[-0.01em]">
                Add Stock Entry
              </DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      {/* Card Image Modal */}
      {showImageModal && mockItem.image_url && (
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>{mockItem.name} - Card Image</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImageModal(false)}
                  className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative w-full h-[600px]">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <h3 className="text-white text-lg font-light tracking-[-0.01em] mb-2">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-xs font-light tracking-[-0.01em]"
                  >
                    {/* {mockSubCollections.find(
                      (sub) => sub.id === mockItem.collection_id
                    )?.name || "Collection"} */}{" "}
                    Collection name placeholder
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs font-light tracking-[-0.01em]"
                  >
                    {mockItem.rarity || "Unknown"}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ItemEditPage;
