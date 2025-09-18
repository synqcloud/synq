// Core
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// Components
import CardRow from "./card-row";
import { ChevronDown, ChevronRight } from "lucide-react";
// Services
import {
  CoreSet,
  InventoryService,
  PriceService,
} from "@synq/supabase/services";

export default function SetRow({
  set,
}: {
  set: Pick<CoreSet, "id" | "name"> & { stock: number };
}) {
  const [expanded, setExpanded] = useState(false);

  const { data: cards } = useQuery({
    queryKey: ["cards", set.id],
    queryFn: () => InventoryService.fetchCardsBySet("client", set.id),
    enabled: expanded,
  });

  // Batch load price alerts for all cards in this set
  const cardIds = cards?.map((card) => card.id) || [];
  const { data: alertCardIds = new Set() } = useQuery({
    queryKey: ["price-alerts", "batch", set.id],
    queryFn: () => PriceService.getUserPriceAlerts(cardIds, "client"),
    enabled: expanded && cardIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div key={set.id}>
      {/* Group Header */}
      <div
        className={`flex items-center px-4 py-2 cursor-pointer hover:bg-accent bg-accent font-light tracking-[-0.01em]`}
        style={{ paddingLeft: `${16 + 1 * 24}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 mr-2" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2" />
        )}
        <span className="flex-1">
          {set.name} ({set.stock})
        </span>
      </div>
      {/* Expanded Content */}
      {expanded &&
        cards?.map((card) => (
          <CardRow
            key={card.id}
            card={card}
            hasAlert={alertCardIds.has(card.id)}
          />
        ))}
    </div>
  );
}
