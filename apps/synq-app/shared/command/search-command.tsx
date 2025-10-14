"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Button,
  VStack,
  HStack,
} from "@synq/ui/component";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDebounce } from "@/hooks/use-debounce";
import { InventoryService } from "@synq/supabase/services";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { AddStockDialog } from "@/domains/inventory/components/dialogs/add-stock-dialog";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchResultItem = {
  id: string;
  name: string;
  tcgplayer_id: string;
  image_url: string | null;
  rarity: string | null;
  collector_number: string;
  stock: number | null;
  tcgplayer_price: number | null;
  core_set_name: string;
  core_library_name: string;
};

interface AddStockState {
  open: boolean;
  cardId: string;
  cardName: string;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [addStockState, setAddStockState] = useState<AddStockState>({
    open: false,
    cardId: "",
    cardName: "",
  });
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  const {
    data: results = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["search-cards", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      return InventoryService.searchCardsByName("client", debouncedQuery, {
        limit: 12,
      });
    },
    enabled: !!debouncedQuery,
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  const selectedCard = results[selectedIndex];

  const handleSelectCard = (item: SearchResultItem) => {
    setSelectedIndex(results.indexOf(item));
  };

  const handleAddStock = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: SearchResultItem,
  ) => {
    e.stopPropagation();
    setAddStockState({
      open: true,
      cardId: item.id,
      cardName: item.name,
    });
  };

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}

      >
        <VisuallyHidden>
          <h2>Search Cards</h2>
        </VisuallyHidden>

        <HStack gap={0} className="h-[700px]">
          {/* Left: Search Results List */}
          <VStack gap={0} className="flex-1 border-r border-border/40 min-w-0">
            <CommandInput
              placeholder="Search for a card..."
              value={query}
              onValueChange={setQuery}
              className="border-b border-border/40"
            />
            <CommandList className="flex-1 overflow-y-auto">
              {isLoading && (
                <VStack
                  gap={2}
                  justify="center"
                  align="center"
                  className="h-full py-8"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Searching...
                  </span>
                </VStack>
              )}
              {error && (
                <VStack
                  gap={2}
                  justify="center"
                  align="center"
                  className="h-full py-8"
                >
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="text-sm text-destructive">
                    {error instanceof Error ? error.message : "Search failed"}
                  </span>
                </VStack>
              )}
              {!isLoading &&
                !error &&
                results.length === 0 &&
                debouncedQuery && (
                  <CommandEmpty className="py-8 text-center">
                    <span className="text-sm text-muted-foreground">
                      No cards found
                    </span>
                  </CommandEmpty>
                )}
              {!isLoading && !error && results.length > 0 && (
                <div className="overflow-hidden">
                  {results.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectCard(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`px-3 py-3 cursor-pointer transition-colors ${
                        index === selectedIndex
                          ? "bg-accent"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <VStack gap={1} align="start" className="w-full">
                        <div className="text-sm font-semibold">{item.name}</div>
                        <HStack
                          gap={2}
                          className="text-xs text-muted-foreground"
                        >
                          <span>{item.core_set_name}</span>
                          <span>•</span>
                          <span className="font-mono">
                            #{item.collector_number}
                          </span>
                          {item.stock !== null && (
                            <>
                              <span>•</span>
                              <span>{item.stock} stock</span>
                            </>
                          )}
                        </HStack>
                      </VStack>
                    </div>
                  ))}
                </div>
              )}
            </CommandList>
          </VStack>

          {/* Right: Card Preview */}
          {selectedCard && !isLoading && (
            <VStack
              gap={4}
              className="w-72 bg-muted/30 p-4 overflow-y-auto flex-shrink-0"
            >
              {/* Card Image */}
              {selectedCard.image_url ? (
                <div className="relative w-full flex-shrink-0 group rounded-lg overflow-hidden border border-border bg-muted">
                  <Image
                    src={selectedCard.image_url}
                    alt={selectedCard.name}
                    width={176}
                    height={248}
                    className="w-full h-auto object-cover"
                  />
                  <button
                    onClick={(e) => handleAddStock(e, selectedCard)}
                    className="absolute inset-0 opacity-0 hover:opacity-100 bg-black/50 flex items-center justify-center transition-opacity"
                    aria-label={`Add stock for ${selectedCard.name}`}
                  >
                    <Plus className="h-5 w-5 text-white" />
                  </button>
                </div>
              ) : (
                <VStack
                  justify="center"
                  align="center"
                  className="w-full aspect-[63/88] rounded-lg border border-border bg-muted"
                >
                  <span className="text-xs text-muted-foreground">
                    No image
                  </span>
                </VStack>
              )}

              {/* Card Details */}
              <VStack gap={3} className="text-sm flex-1">
                <h3 className="font-semibold text-foreground line-clamp-2">
                  {selectedCard.name}
                </h3>

                <VStack gap={2} className="pt-2 border-t border-border/50">
                  <HStack justify="between" align="start">
                    <span className="text-muted-foreground">Set:</span>
                    <span className="font-medium text-right text-xs">
                      {selectedCard.core_set_name}
                    </span>
                  </HStack>
                  <HStack justify="between" align="start">
                    <span className="text-muted-foreground">Game:</span>
                    <span className="font-medium text-right text-xs">
                      {selectedCard.core_library_name}
                    </span>
                  </HStack>
                  <HStack justify="between" align="start">
                    <span className="text-muted-foreground">Number:</span>
                    <span className="font-mono font-medium text-xs">
                      #{selectedCard.collector_number}
                    </span>
                  </HStack>
                </VStack>

                {selectedCard.stock !== null && (
                  <VStack gap={2} className="pt-2 border-t border-border/50">
                    <HStack justify="between">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="font-medium">{selectedCard.stock}</span>
                    </HStack>
                    {selectedCard.tcgplayer_price && (
                      <HStack justify="between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">
                          ${selectedCard.tcgplayer_price.toFixed(2)}
                        </span>
                      </HStack>
                    )}
                  </VStack>
                )}

                <Button
                  onClick={(e) => handleAddStock(e, selectedCard)}
                  className="w-full mt-4"
                >
                  Add Stock
                </Button>
              </VStack>
            </VStack>
          )}
        </HStack>
      </CommandDialog>

      <AddStockDialog
        open={addStockState.open}
        onOpenChangeAction={(open) =>
          setAddStockState((prev) => ({ ...prev, open }))
        }
        cardId={addStockState.cardId}
        cardName={addStockState.cardName}
      />
    </>
  );
}
