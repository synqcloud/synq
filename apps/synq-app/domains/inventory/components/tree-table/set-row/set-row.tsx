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
  standalone = false, // Add this prop to indicate if it's used without a parent library
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

  // Dynamic padding based on whether it's standalone or nested
  const paddingLeft = standalone ? 16 : 16 + 1 * 24;

  return (
    <div>
      <div
        className={`
          group flex items-center px-4 py-2 cursor-pointer bg-accent/60
          transition-all duration-200 ease-out
          hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent
          hover:pl-5 hover:shadow-[inset_3px_0_0_0_hsl(var(--primary))]
          rounded-sm
          ${
            set.stock === 0
              ? "opacity-60 hover:opacity-75 hover:shadow-[inset_3px_0_0_0_hsl(var(--destructive))]"
              : ""
          }
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? (
          <ChevronDown
            className={`
            w-4 h-4 mr-2
            transition-all duration-200
            group-hover:scale-110
            ${
              set.stock === 0
                ? "text-muted-foreground/50 group-hover:text-destructive"
                : "text-muted-foreground group-hover:text-primary"
            }
          `}
          />
        ) : (
          <ChevronRight
            className={`
            w-4 h-4 mr-2
            transition-all duration-200
            group-hover:translate-x-1
            ${
              set.stock === 0
                ? "text-muted-foreground/50 group-hover:text-destructive"
                : "text-muted-foreground group-hover:text-primary"
            }
          `}
          />
        )}

        <div className="flex items-center flex-1 gap-2">
          <span
            className={`
            font-light text-md
            transition-colors duration-200
            ${
              set.stock === 0
                ? "text-muted-foreground group-hover:text-destructive"
                : "text-foreground group-hover:text-primary"
            }
          `}
          >
            {set.name}
          </span>

          {/* Upcoming Badge */}
          {set.is_upcoming && (
            <div
              className="flex items-center gap-1 px-2 py-0.5
              bg-primary/5 dark:bg-primary/10
              border border-primary/20 dark:border-primary/30
              rounded-full
              group-hover:bg-primary/10 dark:group-hover:bg-primary/15
              group-hover:border-primary/30 dark:group-hover:border-primary/40
             "
            >
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">Upcoming</span>
            </div>
          )}

          {/* Stock Badge */}
          {set.stock !== null && (
            <span
              className={`
              px-2 py-0.5 text-xs font-medium rounded
              transition-all duration-200
              inline-block
              ${
                set.stock === 0
                  ? "bg-destructive/10 text-destructive group-hover:bg-destructive/20 group-hover:scale-105"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105"
              }
            `}
            >
              {set.stock}
            </span>
          )}

          {/* Out of Stock */}
          {set.stock === 0 && (
            <span
              className="text-xs text-destructive font-medium
              transition-opacity duration-200
              group-hover:opacity-80"
            >
              (Out of Stock)
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div>
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
