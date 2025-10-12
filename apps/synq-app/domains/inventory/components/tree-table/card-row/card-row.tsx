// Core
import { useState } from "react";
// Components
import StockTable from "../stock-row/stock-table";
import PriceAlertButton from "./price-alerts-button";
import { ChevronDown, ChevronRight, Eye, Plus } from "lucide-react";
// Services
import { CoreCard } from "@synq/supabase/services";
import { Button, HStack } from "@synq/ui/component";
import { Popover, PopoverContent, PopoverTrigger } from "@synq/ui/component";
import { AddStockDialog } from "../../dialogs/add-stock-dialog";
import { cn } from "@synq/ui/utils";
import { formatCurrency } from "@/shared/utils/format-currency";
import { useCurrency } from "@/shared/contexts/currency-context";
import { TcgplayerIcon } from "@/shared/icons/icons";

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
          className="fixed inset-0 z-40"
          onClick={() => setImagePopoverOpen(false)}
        />
      )}

      <div
        className={cn(
          `group flex items-center px-4 py-2 bg-accent/40  cursor-pointer hover:bg-accent transition-colors`,
          outOfStock ? "opacity-60" : "",
          imagePopoverOpen ? "pointer-events-none" : "",
        )}
        style={{
          paddingLeft: `${16 + 2 * 24}px`,
        }}
        onClick={handleRowClick}
      >
        {/* Expand/Collapse Icons */}
        {expanded ? (
          <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground" />
        )}

        {card.image_url && (
          <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleImageClick}
                className="h-6 w-6 p-0 mr-2 rounded hover:bg-accent transition-colors"
                title="View card image"
              >
                <Eye className="w-4 h-4 text-muted-foreground" />
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
                  <p className="text-sm font-medium truncate">{card.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Click outside to close
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Name and stock info */}
        <div className="flex items-center flex-1 min-w-0">
          <span
            className={cn("font-light text-sm", {
              "text-foreground": !outOfStock,
              "text-muted-foreground": outOfStock || card.stock === null,
            })}
          >
            {card.collector_number && (
              <span className="inline-block mr-1.5 px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded">
                #{card.collector_number}
              </span>
            )}
            {card.name}
            {card.stock !== null && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({card.stock})
              </span>
            )}
            {outOfStock && (
              <span className="ml-1 text-xs text-red-500">(Out of Stock)</span>
            )}
          </span>

          {/* Action Icons */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleAddStockClick}
              className="h-6 w-6 p-0 rounded opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"
              title="Add stock"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Price with Alert Button - Fixed width container for alignment */}
        {/*<HStack
          align="center"
          gap={1.5}
          className={cn("border rounded-md px-1.5 py-1", {
            "border-amber-500 hover:border-amber-400": hasAlert,
          })}
        >
          <button
            onClick={handleExternalLinkClick}
            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
            title={
              card.tcgplayer_id ? "View on TCGPlayer" : "Search on TCGPlayer"
            }
          >
            <TcgplayerIcon className="h-4 w-4" />
            <span className="text-xs font-semibold transition-colors duration-200 group-hover:text-primary flex items-center">
              {card?.tcgplayer_price != null
                ? formatCurrency(card.tcgplayer_price || 0, currency)
                : ""}
            </span>
          </button>
        </HStack>*/}

        <PriceAlertButton cardId={card.id} hasAlert={hasAlert} />
      </div>

      {expanded && (
        <div>
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
