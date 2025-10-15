import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDebounce } from "@/hooks/use-debounce";
import { InventoryService } from "@synq/supabase/services";
import { Loader2, AlertCircle, Plus, Search, X } from "lucide-react";
import { AddStockDialog } from "@/domains/inventory/components/dialogs/add-stock-dialog";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AddStockState {
  open: boolean;
  cardId: string;
  cardName: string;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const [query, setQuery] = useState("");
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>("");
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [showLibraryDropdown, setShowLibraryDropdown] = useState(false);
  const [addStockState, setAddStockState] = useState<AddStockState>({
    open: false,
    cardId: "",
    cardName: "",
  });
  const debouncedQuery = useDebounce(query, 200);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch available games/libraries
  const { data: libraries = [] } = useQuery({
    queryKey: ["user-libraries"],
    queryFn: async () => {
      const librariesData = await InventoryService.getCoreLibraries("client");
      return librariesData;
    },
    enabled: open,
  });

  const {
    data: results = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["search-cards", debouncedQuery, selectedLibraryId],
    queryFn: async () => {
      if (!debouncedQuery || !selectedLibraryId) return [];
      return InventoryService.searchCardsByLibrary(
        "client",
        selectedLibraryId,
        debouncedQuery,
        {
          limit: 20,
        },
      );
    },
    enabled: !!debouncedQuery && !!selectedLibraryId,
  });

  useEffect(() => {
    setSelectedCardIndex(0);
  }, [debouncedQuery]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const selectedCard = results[selectedCardIndex];
  const selectedLibrary = libraries.find((lib) => lib.id === selectedLibraryId);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedLibraryId) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedCardIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedCardIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedCard) {
          setAddStockState({
            open: true,
            cardId: selectedCard.id,
            cardName: selectedCard.name,
          });
        }
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => onOpenChange(false)}
        />
      )}

      <div
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background shadow-2xl transition-all duration-200 ${
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <VisuallyHidden>
          <h2>Search and Add Card Stock</h2>
        </VisuallyHidden>

        <div className="flex h-[600px] overflow-hidden rounded-2xl">
          {/* Left Panel: Search and Results */}
          <div className="flex w-2/3 flex-col bg-background">
            {/* Header with Game Selection */}
            <div className="border-b border-border/40 bg-gradient-to-br from-muted/50 to-background p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Select Game
                </h3>
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-lg p-1 hover:bg-accent/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Game Selection Tabs */}
              <div className="relative">
                <div className="flex flex-wrap gap-2">
                  {libraries.map((lib) => (
                    <button
                      key={lib.id}
                      onClick={() => {
                        setSelectedLibraryId(lib.id);
                        setShowLibraryDropdown(false);
                        setQuery("");
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                        selectedLibraryId === lib.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted/60 text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="h-5 w-5 rounded-full bg-current/10" />
                      {lib.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="border-b border-border/40 p-4">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={
                    selectedLibraryId
                      ? "Search cards..."
                      : "Select a game first..."
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!selectedLibraryId}
                  className="w-full bg-transparent py-3 pl-10 pr-4 text-base outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 rounded p-1 hover:bg-accent/50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Results List */}
            <div ref={resultsRef} className="flex-1 overflow-y-auto">
              {!selectedLibraryId ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2 text-sm text-muted-foreground">
                      👆 Select a game to start searching
                    </div>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Searching...
                    </span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="text-xs text-destructive">
                      {error instanceof Error ? error.message : "Search failed"}
                    </span>
                  </div>
                </div>
              ) : query && results.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-1 text-sm text-muted-foreground">
                      No cards found
                    </div>
                    <div className="text-xs text-muted-foreground/60">
                      Try a different search term
                    </div>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1 p-2">
                  {results.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedCardIndex(index)}
                      onMouseEnter={() => setSelectedCardIndex(index)}
                      className={`group w-full rounded-lg px-3 py-3 text-left transition-all ${
                        index === selectedCardIndex
                          ? "bg-primary/15 ring-2 ring-primary/40"
                          : "hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <div className="relative h-10 w-8 flex-shrink-0 overflow-hidden rounded-md border border-border/40">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">
                              {item.core_set_name}
                            </span>
                            <span>•</span>
                            <span className="font-mono">
                              #{item.collector_number}
                            </span>
                            {item.stock !== null && (
                              <>
                                <span className="text-primary font-medium">
                                  {item.stock !== 0
                                    ? `${item.stock} in stock`
                                    : ""}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {/*{item.tcgplayer_price && (
                          <div className="flex-shrink-0 text-right">
                            <div className="text-xs font-semibold text-muted-foreground">
                              ${item.tcgplayer_price.toFixed(2)}
                            </div>
                          </div>
                        )}*/}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Panel: Card Details & Quick Add */}
          {selectedCard && !isLoading && (
            <div className="w-1/3 border-l border-border/40 bg-gradient-to-br from-muted/30 to-background flex flex-col">
              <div className="flex-1 overflow-y-auto p-5">
                {/* Card Image */}
                {selectedCard.image_url ? (
                  <div className="relative mb-6 overflow-hidden rounded-xl border border-border/40 bg-muted shadow-lg">
                    <Image
                      src={selectedCard.image_url}
                      alt={selectedCard.name}
                      width={200}
                      height={280}
                      className="h-auto w-full object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="mb-6 flex h-[280px] items-center justify-center rounded-xl border border-border/40 bg-muted">
                    <span className="text-xs text-muted-foreground">
                      No image
                    </span>
                  </div>
                )}

                {/* Card Info */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground line-clamp-3">
                      {selectedCard.name}
                    </h2>
                  </div>

                  <div className="space-y-3 rounded-lg bg-muted/40 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Set</span>
                      <span className="font-medium text-foreground">
                        {selectedCard.core_set_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Game</span>
                      {/*<span className="font-medium text-foreground">
                        {selectedCard.core_library_name}
                      </span>*/}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Card #</span>
                      <span className="font-mono font-medium text-foreground">
                        {selectedCard.collector_number}
                      </span>
                    </div>
                    {selectedCard.rarity && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rarity</span>
                        <span className="font-medium text-foreground">
                          {selectedCard.rarity}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedCard.stock !== null && (
                    <div className="space-y-3 rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Your Stock
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {selectedCard.stock}
                        </span>
                      </div>
                      {/*{selectedCard.tcgplayer_price && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            TCGPlayer
                          </span>
                          <span className="font-semibold text-foreground">
                            ${selectedCard.tcgplayer_price.toFixed(2)}
                          </span>
                        </div>
                      )}*/}
                    </div>
                  )}
                </div>
              </div>

              {/* Add Stock Button */}
              <div className="border-t border-border/40 p-4">
                <button
                  onClick={() =>
                    setAddStockState({
                      open: true,
                      cardId: selectedCard.id,
                      cardName: selectedCard.name,
                    })
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                  Add Stock
                </button>
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  Press <kbd className="rounded bg-muted px-2 py-1">Enter</kbd>{" "}
                  to add
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
