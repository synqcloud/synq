"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { InventoryService, PriceService } from "@synq/supabase/services";
import CardRow from "./card-row/card-row";

export default function InventoryTableSearchResults({
  query,
  options,
}: {
  query: string;
  options?: {
    offset?: number;
    limit?: number;
    stockFilter?: "all" | "in-stock" | "out-of-stock";
  };
}) {
  const normalized = useMemo(() => query.trim(), [query]);

  const { data = [], isLoading } = useQuery({
    queryKey: ["inventory-search", normalized],
    queryFn: () =>
      InventoryService.searchCardsByName("client", normalized, options),
    enabled: normalized.length > 0,
    staleTime: 30_000,
  });

  // Add alert fetching
  const cardIds = useMemo(() => data.map((c) => c.id), [data]);
  const { data: alertCardIds = new Set() } = useQuery({
    queryKey: ["price-alerts", "batch", "search", cardIds],
    queryFn: () => PriceService.getUserPriceAlerts(cardIds, "client"),
    enabled: cardIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (!normalized) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-muted-foreground">
        Searching…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-muted-foreground">
        No results for &quot;{normalized}&quot;
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {data.map((card) => {
        const nameWithContext = [
          card.name,
          card.core_set_name ? `(${card.core_set_name}` : null,
          card.core_library_name
            ? card.core_set_name
              ? ` · ${card.core_library_name})`
              : `(${card.core_library_name})`
            : card.core_set_name
              ? ")"
              : null,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <CardRow
            key={card.id}
            card={{
              id: card.id,
              name: nameWithContext,
              tcgplayer_id: card.tcgplayer_id,
              stock: card.stock,
              rarity: card.rarity,
              image_url: card.image_url,
              collector_number: card.collector_number,
            }}
            hasAlert={alertCardIds.has(card.id)}
          />
        );
      })}
    </div>
  );
}
