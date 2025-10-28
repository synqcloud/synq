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

export default function CardRow({
  card,
  hasAlert,
}: {
  card: Pick<
    CoreCard,
    "id" | "name" | "tcgplayer_id" | "image_url" | "rarity" | "collector_number"
  > & {
    stock: number | null;
  };
  hasAlert: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [addStockDialogOpen, setAddStockDialogOpen] = useState(false);
  const outOfStock = card.stock === 0;

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
        className={`
          flex items-center px-4 py-2 cursor-pointer hover:bg-muted/15
          border-l border-border transition-colors
          ${outOfStock ? "opacity-50" : ""}
          ${imagePopoverOpen ? "pointer-events-none" : ""}
        `}
        style={{
          paddingLeft: `${16 + 2 * 20}px`,
          marginLeft: `${16 + 1 * 20}px`,
        }}
        onClick={handleRowClick}
      >
        <CreditCard className="w-3.5 h-3.5 mr-2.5 text-muted-foreground/70 flex-shrink-0" />

        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
        )}

        <div className="flex items-center flex-1 min-w-0">
          <span
            className={cn("font-light text-sm", {
              "text-foreground": !outOfStock,
              "text-muted-foreground": outOfStock || card.stock === null,
            })}
          >
            {card.collector_number && (
              <span className="inline-block mr-1.5 px-1 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded">
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
                    className="h-6 w-6 p-0 hover:bg-muted/50 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="View card image"
                  >
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
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
              onClick={handleExternalLinkClick}
              className="h-6 w-6 p-0 hover:bg-muted/50 rounded transition-colors opacity-0 group-hover:opacity-100"
              title={
                card.tcgplayer_id ? "View on TCGPlayer" : "Search on TCGPlayer"
              }
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <HStack gap={2} align="center" className="flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleAddStockClick}
            className="h-6 w-6 p-0 rounded opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"
            title="Add stock"
          >
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>

          <PriceAlertButton cardId={card.id} hasAlert={hasAlert} />
        </HStack>
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
