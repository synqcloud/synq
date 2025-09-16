// Core
import { useState } from "react";
// Components
import StockTable from "./stock-table";
import PriceAlertButton from "./card/price-alerts-button";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
// Services
import { CoreCard } from "@synq/supabase/services";
import Link from "next/link";

export default function CardRow({
  card,
}: {
  card: Pick<CoreCard, "id" | "name"> & { stock: number };
}) {
  const [expanded, setExpanded] = useState(false);
  const outOfStock = card.stock === 0;

  return (
    <div key={card.id}>
      {/* Card Header */}
      <div
        className={`flex items-center px-4 py-2 cursor-pointer border-l-2 ${
          outOfStock
            ? "bg-muted/30 opacity-60 border-muted"
            : "bg-accent/50 border-primary"
        }`}
        style={{ paddingLeft: `${16 + 2 * 24}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 mr-2" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2" />
        )}
        <span
          className={`flex-1 font-light tracking-[-0.01em] ${outOfStock ? "text-muted-foreground" : ""}`}
        >
          {card.name} ({card.stock})
          {outOfStock && (
            <span className="text-xs text-red-500 ml-2">(Out of Stock)</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <PriceAlertButton cardId={card.id} />
          <Link
            href={`/inventory/item/${card.id}`}
            target="_blank"
            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent/70 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Search className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Link>
        </div>
      </div>
      {/* Expanded Stock Table */}
      {expanded && <StockTable cardId={card.id} cardName={card.name} />}
    </div>
  );
}
