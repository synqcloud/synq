import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import CardRow from "../card-row/card-row";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import {
  CoreCard,
  CoreSet,
  InventoryService,
  PriceService,
} from "@synq/supabase/services";
import { StockFilterType } from "../inventory-table-filters";

const CARDS_PER_BATCH = 44;

export default function SetRow({
  set,
  stockFilter,
  standalone = false,
}: {
  set: Pick<CoreSet, "id" | "name"> & {
    stock: number | null;
    is_upcoming: boolean;
    total_value: number | null;
  };
  stockFilter: StockFilterType;
  standalone?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [allCards, setAllCards] = useState<
    Array<
      Pick<
        CoreCard,
        | "id"
        | "name"
        | "tcgplayer_id"
        | "image_url"
        | "rarity"
        | "collector_number"
      > & {
        stock: number | null;
        tcgplayer_price: number | null;
      }
    >
  >([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollObserverRef = useRef<HTMLDivElement>(null);

  const { data: initialCards } = useQuery({
    queryKey: ["cards", set.id, stockFilter],
    queryFn: () =>
      InventoryService.fetchCardsBySet("client", set.id, {
        offset: 0,
        limit: CARDS_PER_BATCH,
        stockFilter,
      }),
    enabled: expanded,
    staleTime: 0,
  });

  useEffect(() => {
    if (expanded) {
      setAllCards([]);
      setOffset(0);
      setHasMore(true);
      setIsLoading(false);
    } else {
      setAllCards([]);
      setOffset(0);
      setHasMore(true);
    }
  }, [expanded, stockFilter]);

  useEffect(() => {
    if (expanded && initialCards) {
      setAllCards(initialCards);
      setOffset(initialCards.length);
      setHasMore(initialCards.length >= CARDS_PER_BATCH);
    }
  }, [expanded, initialCards]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !expanded) return;
    setIsLoading(true);
    try {
      const newCards = await InventoryService.fetchCardsBySet(
        "client",
        set.id,
        {
          offset,
          limit: CARDS_PER_BATCH,
          stockFilter,
        },
      );
      if (newCards.length < CARDS_PER_BATCH) setHasMore(false);
      setAllCards((prev) => [...prev, ...newCards]);
      setOffset((prev) => prev + newCards.length);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, expanded, offset, set.id, stockFilter]);

  useEffect(() => {
    if (!expanded || !hasMore || isLoading || allCards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    const node = scrollObserverRef.current;
    if (node) observer.observe(node);

    return () => observer.disconnect();
  }, [expanded, hasMore, isLoading, allCards.length, loadMore]);

  const cardIds = allCards.map((c) => c.id);
  const { data: alertCardIds = new Set() } = useQuery({
    queryKey: ["price-alerts", "batch", set.id, cardIds],
    queryFn: () => PriceService.getUserPriceAlerts(cardIds, "client"),
    enabled: expanded && cardIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const paddingLeft = standalone ? 16 : 16 + 1 * 20;
  const outOfStock = set.stock === 0;

  return (
    <div>
      <div
        className="group flex items-center gap-3 px-4 py-2.5 cursor-pointer
          transition-all duration-150 ease-out bg-accent/60 hover:bg-accent/80
          border-l-2 border-transparent hover:border-primary/60 rounded-md"
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className={`text-sm font-normal transition-colors ${
              outOfStock
                ? "text-muted-foreground group-hover:text-destructive"
                : "text-foreground group-hover:text-primary"
            }`}
          >
            {set.name}
          </span>

          {set.stock !== null && (
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                outOfStock
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {set.stock}
            </span>
          )}

          {set.is_upcoming && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/30 rounded-full text-[10px] font-medium text-primary flex-shrink-0">
              <Clock className="w-2.5 h-2.5" />
              Upcoming
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="space-y-0.5">
          {allCards.map((card) => (
            <CardRow
              key={card.id}
              card={card}
              hasAlert={alertCardIds.has(card.id)}
              standalone={standalone}
            />
          ))}

          {isLoading && (
            <div className="flex items-center justify-center py-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-muted border-t-foreground rounded-full animate-spin"></div>
                <span className="text-xs">Loading more cards...</span>
              </div>
            </div>
          )}

          {hasMore && !isLoading && allCards.length > 0 && (
            <div ref={scrollObserverRef} className="h-1" />
          )}

          {!hasMore && allCards.length > CARDS_PER_BATCH && (
            <div className="text-center py-2 text-xs text-muted-foreground">
              All {allCards.length} cards loaded
            </div>
          )}
        </div>
      )}
    </div>
  );
}
