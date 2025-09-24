// Core
import { useState } from "react";
// Components
import StockTable from "./stock-table";
import PriceAlertButton from "./card/price-alerts-button";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
// Services
import { CoreCard } from "@synq/supabase/services";
import { Button } from "@synq/ui/component";

export default function CardRow({
  card,
  hasAlert,
}: {
  card: Pick<CoreCard, "id" | "name" | "tcgplayer_id"> & {
    stock: number | null;
  };
  hasAlert: boolean;
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
          {card.name}
          {card.stock !== null ? ` (${card.stock})` : ""}
          {outOfStock && (
            <span className="text-xs text-red-500 ml-2">(Out of Stock)</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <PriceAlertButton cardId={card.id} hasAlert={hasAlert} />
          {card.tcgplayer_id && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open(
                  `https://www.tcgplayer.com/product/${card.tcgplayer_id}`,
                  "_blank",
                );
              }}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="View on TCGPlayer"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </Button>
          )}
        </div>
      </div>
      {/* Expanded Stock Table */}
      {expanded && <StockTable cardId={card.id} cardName={card.name} />}
    </div>
  );
}
