// Core
import { useState } from "react";
// Components
import StockTable from "../stock-row/stock-table";
import PriceAlertButton from "./price-alerts-button";
import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Eye,
  Plus,
} from "lucide-react";
// Services
import { CoreCard } from "@synq/supabase/services";
import { Button, HStack } from "@synq/ui/component";
import { Popover, PopoverContent, PopoverTrigger } from "@synq/ui/component";
import { AddStockDialog } from "../../dialogs/add-stock-dialog";
import { cn } from "@synq/ui/utils";
import { formatCurrency } from "@/shared/utils/format-currency";
import { useCurrency } from "@/shared/contexts/currency-context";

export default function CardRow({
  card,
  hasAlert,
}: {
  card: Pick<
    CoreCard,
    "id" | "name" | "tcgplayer_id" | "image_url" | "rarity" | "collector_number"
  > & {
    stock: number | null;
    tcgplayer_price: number | null;
  };
  hasAlert: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [addStockDialogOpen, setAddStockDialogOpen] = useState(false);
  const outOfStock = card.stock === 0;

  const { currency } = useCurrency();

  const handleRowClick = () => setExpanded(!expanded);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePopoverOpen(true);
  };

  const handleAddStockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAddStockDialogOpen(true);
  };

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const url = card.tcgplayer_id
      ? `https://www.tcgplayer.com/product/${card.tcgplayer_id}`
      : `https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(card.name)}`;
    window.open(url, "_blank");
  };

  return (
    <div key={card.id} className="group">
      {imagePopoverOpen && (
        <div
          className="fixed inset-0 bg-background/20 z-40"
          onClick={() => setImagePopoverOpen(false)}
        />
      )}

      <div
        className={cn(
          `group flex items-center px-4 py-2 cursor-pointer
           border-l transition-all duration-200 ease-out
           rounded-sm`,
          outOfStock ? "opacity-50 hover:opacity-70" : "",
          imagePopoverOpen ? "pointer-events-none" : "",
          hasAlert
            ? " border-amber-500 hover:border-amber-400"
            : "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent border-border hover:border-primary/40",
        )}
        style={{
          paddingLeft: `${16 + 2 * 24}px`,
          marginLeft: `${16 + 1 * 24}px`,
        }}
        onClick={handleRowClick}
      >
        {/* 💳 CreditCard icon */}
        <CreditCard
          className="w-3.5 h-3.5 mr-2.5 text-muted-foreground/70 flex-shrink-0
          transition-all duration-200 group-hover:text-primary group-hover:scale-110"
        />

        {/* Expand/Collapse Icons */}
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 mr-2 text-muted-foreground transition-all duration-200 group-hover:scale-110" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 mr-2 text-muted-foreground transition-all duration-200 group-hover:translate-x-1" />
        )}

        {/* Name and stock info */}
        <div className="flex items-center flex-1 min-w-0">
          <span
            className={cn("font-light text-sm transition-colors duration-200", {
              "text-foreground group-hover:text-primary": !outOfStock,
              "text-muted-foreground group-hover:text-foreground":
                outOfStock || card.stock === null,
            })}
          >
            {card.collector_number && (
              <span
                className="inline-block mr-1.5 px-1.5 py-0.5
                  bg-muted text-muted-foreground text-[10px] font-medium rounded
                  transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105"
              >
                #{card.collector_number}
              </span>
            )}
            {card.name}
            {card.stock !== null && (
              <span className="ml-2 text-xs text-muted-foreground transition-colors duration-200 group-hover:text-foreground group-hover:font-medium">
                ({card.stock})
              </span>
            )}
            {outOfStock && (
              <span className="ml-1 text-xs text-red-500 transition-opacity duration-200 group-hover:opacity-80">
                (Out of Stock)
              </span>
            )}
          </span>

          {/* Action Icons */}
          <div className="flex items-center gap-1 ml-2">
            {card.image_url && (
              <Popover
                open={imagePopoverOpen}
                onOpenChange={setImagePopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleImageClick}
                    className="h-6 w-6 p-0 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:scale-110 transition-all duration-200"
                    title="View card image"
                  >
                    <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-2 max-w-sm z-50"
                  side="left"
                  align="center"
                  sideOffset={10}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-2">
                    <div className="relative overflow-hidden rounded-lg border bg-background shadow-lg">
                      <img
                        src={card.image_url}
                        alt={`${card.name} card image`}
                        className="h-80 w-auto object-contain max-w-none"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-card.png";
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium truncate">
                        {card.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click outside to close
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={handleAddStockClick}
              className="h-6 w-6 p-0 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:scale-110 transition-all duration-200"
              title="Add stock"
            >
              <Plus className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleExternalLinkClick}
              className="h-6 w-6 p-0 rounded opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:scale-110 transition-all duration-200"
              title={
                card.tcgplayer_id ? "View on TCGPlayer" : "Search on TCGPlayer"
              }
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
            </Button>
          </div>
        </div>

        {/* Price with Alert Button - Fixed width container for alignment */}
        <div className="flex items-center gap-2 min-w-[100px] justify-end">
          <PriceAlertButton cardId={card.id} hasAlert={hasAlert} />
          <span className="text-xs font-semibold transition-colors duration-200 group-hover:text-primary w-[60px] text-center">
            {card?.tcgplayer_price != null
              ? formatCurrency(card.tcgplayer_price || 0, currency)
              : "-"}
          </span>
        </div>
      </div>

      {expanded && (
        <div
          className="border-l border-border/50"
          style={{ marginLeft: `${16 + 2 * 24}px` }}
        >
          <StockTable cardId={card.id} cardName={card.name} />
        </div>
      )}

      <AddStockDialog
        open={addStockDialogOpen}
        onOpenChangeAction={setAddStockDialogOpen}
        cardId={card.id}
        cardName={card.name}
      />
    </div>
  );
}
