/**
 * New Listings-focused Inventory View
 * Shows cards grouped by listing status with marketplace sync info
 */
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { InventoryService } from "@synq/supabase/services";
import {
  Button,
  HStack,
  Kbd,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@synq/ui/component";
import {
  Search,
  Package,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Eye,
  Edit,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@synq/ui/utils";
import { MarketplaceIcon } from "@/shared/icons/marketplace-icon";
import { SearchCommand } from "@/shared/command/search-command";

type ListingStatus = "all" | "listed" | "unlisted" | "out-of-sync";
type SortBy = "recent" | "price-high" | "price-low" | "name";

// Listing Card Component
function ListingCard({ listing }: { listing: any }) {
  const [expanded, setExpanded] = useState(false);
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);

  const marketplaces = listing.marketplaces || [];
  const hasMarketplaces = marketplaces.length > 0;
  const isOutOfStock = listing.quantity === 0;
  const priceChange = listing.price_change_24h || 0;
  const isPriceUp = priceChange > 0;

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card transition-all hover:shadow-md",
        isOutOfStock && "opacity-60",
      )}
    >
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Card Image */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-32 rounded-md overflow-hidden border bg-muted">
              {listing.image_url ? (
                <img
                  src={listing.image_url}
                  alt={listing.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            {isOutOfStock && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                <span className="text-xs font-medium text-red-500">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Card Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-medium text-sm leading-tight mb-1">
                  {listing.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {listing.set_name}
                </p>

                {/* Condition & Language */}
                <div className="flex items-center gap-2 text-xs mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-muted font-medium">
                    {listing.condition}
                  </span>
                  <span className="text-muted-foreground">
                    {listing.language}
                  </span>
                  <span className="text-muted-foreground">
                    Qty: {listing.quantity}
                  </span>
                </div>

                {/* Marketplaces */}
                <div className="flex items-center gap-2">
                  {hasMarketplaces ? (
                    <>
                      <span className="text-xs text-muted-foreground">
                        Listed on:
                      </span>
                      <HStack gap={1}>
                        {marketplaces.map((mp: string) => (
                          <MarketplaceIcon
                            key={mp}
                            marketplace={mp}
                            showTooltip={true}
                          />
                        ))}
                      </HStack>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Not listed
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    ${listing.tcgplayer_price?.toFixed(2) || "—"}
                  </div>
                  {priceChange !== 0 && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        isPriceUp ? "text-green-500" : "text-red-500",
                      )}
                    >
                      <TrendingUp
                        className={cn("w-3 h-3", !isPriceUp && "rotate-180")}
                      />
                      {Math.abs(priceChange).toFixed(2)}% (24h)
                    </div>
                  )}
                </div>

                <HStack gap={1}>
                  {listing.tcgplayer_id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100"
                      onClick={() =>
                        window.open(
                          `https://www.tcgplayer.com/product/${listing.tcgplayer_id}`,
                          "_blank",
                        )
                      }
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </HStack>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">SKU:</span>
                <span className="ml-2">{listing.sku || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>
                <span className="ml-2">{listing.location || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cost (COGS):</span>
                <span className="ml-2">${listing.cogs?.toFixed(2) || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Profit Margin:</span>
                <span className="ml-2">
                  {listing.cogs && listing.tcgplayer_price
                    ? `${(((listing.tcgplayer_price - listing.cogs) / listing.tcgplayer_price) * 100).toFixed(1)}%`
                    : "—"}
                </span>
              </div>
            </div>

            {/* Marketplace-specific pricing */}
            {hasMarketplaces && listing.marketplace_prices && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  Marketplace Prices
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(listing.marketplace_prices).map(
                    ([mp, price]) => (
                      <div
                        key={mp}
                        className="flex items-center justify-between p-2 rounded bg-muted/50"
                      >
                        <MarketplaceIcon marketplace={mp} />
                        <span className="text-sm font-medium">
                          ${(price as number)?.toFixed(2) || "—"}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                Update Prices
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Edit className="w-3.5 h-3.5 mr-2" />
                Edit Listing
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Listings View
export default function ListingsView() {
  const [listingStatus, setListingStatus] = useState<ListingStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch all listings (cards with stock)
  const {
    data: listings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      console.log("Starting listings fetch...");

      // Fetch all cards with their stock info
      const cards = await InventoryService.fetchCardsBySet("client", null, {
        offset: 0,
        limit: 1000,
        stockFilter: "in-stock", // Only fetch cards that have stock
      });

      console.log("Cards fetched:", cards.length);

      if (cards.length === 0) {
        console.log("No cards found with stock");
        return [];
      }

      // For each card with stock, fetch detailed stock info
      const listingsWithDetails = await Promise.all(
        cards
          .filter((card) => card.stock !== null && card.stock > 0)
          .map(async (card) => {
            try {
              console.log(`Fetching stock for card: ${card.name} (${card.id})`);
              const stockDetails = await InventoryService.fetchStockByCard(
                "client",
                card.id,
              );
              console.log(`Stock details for ${card.name}:`, stockDetails);

              return stockDetails.map((stock) => ({
                ...card,
                ...stock,
                stock_id: stock.stock_id,
                set_name: card.name, // You may need to add set name to the card data
              }));
            } catch (err) {
              console.error(`Error fetching stock for card ${card.id}:`, err);
              return [];
            }
          }),
      );

      const flattened = listingsWithDetails.flat();
      console.log("Final listings count:", flattened.length);
      console.log("Sample listing:", flattened[0]);

      return flattened;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Debug logging
  useEffect(() => {
    console.log("Query state:", {
      isLoading,
      error,
      listingsCount: listings.length,
    });
  }, [isLoading, error, listings]);

  // Filter and sort client-side
  const filteredListings = listings
    .filter((listing) => {
      if (listingStatus === "all") return true;
      if (listingStatus === "listed")
        return listing.marketplaces && listing.marketplaces.length > 0;
      if (listingStatus === "unlisted")
        return !listing.marketplaces || listing.marketplaces.length === 0;
      if (listingStatus === "out-of-sync") {
        // Check if marketplace prices differ significantly
        return (
          listing.marketplace_prices &&
          Object.values(listing.marketplace_prices).some(
            (price) =>
              Math.abs((price as number) - listing.tcgplayer_price) > 0.5,
          )
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-high":
          return (b.tcgplayer_price || 0) - (a.tcgplayer_price || 0);
        case "price-low":
          return (a.tcgplayer_price || 0) - (b.tcgplayer_price || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
        default:
          return 0; // Keep original order
      }
    });

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-4 space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{listings.length}</div>
                <div className="text-xs text-muted-foreground">
                  Total Listings
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">
                  {
                    listings.filter(
                      (l) => l.marketplaces && l.marketplaces.length > 0,
                    ).length
                  }
                </div>
                <div className="text-xs text-muted-foreground">Listed</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">
                  {
                    listings.filter(
                      (l) => !l.marketplaces || l.marketplaces.length === 0,
                    ).length
                  }
                </div>
                <div className="text-xs text-muted-foreground">Unlisted</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">
                  $
                  {listings
                    .reduce(
                      (sum, l) =>
                        sum + (l.tcgplayer_price || 0) * (l.quantity || 0),
                      0,
                    )
                    .toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Total Value</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between gap-4">
              <HStack gap={2}>
                <Button
                  variant={listingStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setListingStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={listingStatus === "listed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setListingStatus("listed")}
                >
                  Listed
                </Button>
                <Button
                  variant={listingStatus === "unlisted" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setListingStatus("unlisted")}
                >
                  Unlisted
                </Button>
                <Button
                  variant={
                    listingStatus === "out-of-sync" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setListingStatus("out-of-sync")}
                >
                  Out of Sync
                </Button>
              </HStack>

              <HStack gap={2}>
                <select
                  className="px-3 py-1.5 text-sm border rounded-md bg-background"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                >
                  <option value="recent">Recent</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="name">Name</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSearchOpen(true)}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                  <Kbd>⌘P</Kbd>
                </Button>
              </HStack>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Loading listings...
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-48 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : filteredListings.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package />
                </EmptyMedia>
                <EmptyTitle>No listings found</EmptyTitle>
                <EmptyDescription>
                  {listingStatus === "unlisted"
                    ? "All your items are already listed"
                    : listings.length === 0
                      ? "Start by adding cards to your inventory. You have no cards with stock."
                      : `No items match the "${listingStatus}" filter`}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="text-xs text-muted-foreground mb-4">
                  Total listings loaded: {listings.length}
                </div>
                <Button onClick={() => setSearchOpen(true)} className="gap-2">
                  <Search className="h-4 w-4" />
                  Search cards
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.stock_id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
