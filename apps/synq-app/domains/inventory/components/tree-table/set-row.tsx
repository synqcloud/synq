// Core
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Components
import CardRow from "./card-row";
import { ChevronDown, ChevronRight } from "lucide-react";

// Services
import { CoreSet, InventoryService } from "@synq/supabase/services";

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
      {expanded && cards?.map((card) => <CardRow key={card.id} card={card} />)}
    </div>
  );
}
