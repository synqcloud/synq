import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import CardRow from "./card-row";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  CoreCard,
  CoreSet,
  InventoryService,
  PriceService,
} from "@synq/supabase/services";
import { StockFilterType } from "../inventory-table-filters";

const CARDS_PER_BATCH = 15;

export default function SetRow({
  set,
  stockFilter,
}: {
  set: Pick<CoreSet, "id" | "name"> & { stock: number | null };
  stockFilter: StockFilterType;
}) {
  const [expanded, setExpanded] = useState(false);
  const [allCards, setAllCards] = useState<
    Array<
      Pick<CoreCard, "id" | "name" | "tcgplayer_id"> & { stock: number | null }
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
  }, [isLoading, hasMore, expanded, offset, set.id]);

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

  return (
    <div>
      <div
        className={`flex items-center px-4 py-2 cursor-pointer hover:bg-accent bg-accent ${
          set.stock === null ? "opacity-60" : ""
        }`}
        style={{ paddingLeft: `${16 + 1 * 24}px` }}
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 mr-2" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2" />
        )}
        <span className="flex-1">
          {set.name}
          {set.stock !== null ? ` (${set.stock})` : ""}
          {set.stock === 0 && (
            <span className="text-xs text-red-500 ml-2">(Out of Stock)</span>
          )}
        </span>
      </div>

      {expanded && (
        <>
          {allCards.map((card) => (
            <CardRow
              key={card.id}
              card={card}
              hasAlert={alertCardIds.has(card.id)}
            />
          ))}
          {isLoading && (
            <div className="text-center py-2 text-xs">Loading more…</div>
          )}
          {hasMore && !isLoading && allCards.length > 0 && (
            <div ref={scrollObserverRef} className="h-1" />
          )}
        </>
      )}
    </div>
  );
}
