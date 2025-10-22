// Core
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Components
import PriceAlertButton from "./price-alerts-button";
import { AddStockDialog } from "../../dialogs/add-stock-dialog";
import { ChevronDown, ChevronRight, Eye, Plus } from "lucide-react";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@synq/ui/component";
import { HStack, VStack } from "@synq/ui/component";

// Services
import {
  CoreCard,
  InventoryService,
  UserStockWithListings,
} from "@synq/supabase/services";
import { cn } from "@synq/ui/utils";

// Import the CardVariantRow component
import { CardVariantRow } from "./card-variant-row";

export default function CardRow({
  card,
  hasAlert,
  standalone = false,
}: {
  card: Pick<
    CoreCard,
    "id" | "name" | "tcgplayer_id" | "image_url" | "rarity" | "collector_number"
  > & {
    stock: number | null;
    tcgplayer_price: number | null;
  };
  hasAlert: boolean;
  standalone?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);
  const [addStockDialogOpen, setAddStockDialogOpen] = useState(false);
  const outOfStock = card.stock === 0;

  const { data: stockVariants, isLoading } = useQuery({
    queryKey: ["stock", card.id, true],
    queryFn: () => InventoryService.fetchStockByCard("client", card.id, true),
    enabled: expanded,
  });

  const handleRowClick = () => setExpanded(!expanded);

  const handleAddStockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAddStockDialogOpen(true);
  };

  const paddingLeft = standalone ? 16 : 16 + 2 * 20;
  const variantPaddingLeft = paddingLeft + 50;

  return (
    <VStack gap={0} className="group">
      <HStack
        gap={3}
        align="center"
        className={cn(
          "group px-4 py-2 cursor-pointer transition-all duration-150 ease-out bg-accent/40 hover:bg-accent/60 border-l-2 border-transparent hover:border-primary/40 rounded-md",
          outOfStock && "opacity-50",
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleRowClick}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
        )}

        {card.image_url && (
          <Popover open={imageHovered} onOpenChange={setImageHovered}>
            <PopoverTrigger asChild>
              <div
                onMouseEnter={() => setImageHovered(true)}
                onMouseLeave={() => setImageHovered(false)}
                className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors flex-shrink-0 cursor-pointer"
                title="Hover to view card image"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-2 max-w-sm z-50"
              side="left"
              align="center"
              sideOffset={10}
              onMouseEnter={() => setImageHovered(true)}
              onMouseLeave={() => setImageHovered(false)}
            >
              <VStack gap={2}>
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
                <VStack gap={0} className="text-center">
                  <p className="text-sm font-medium truncate">{card.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Move cursor away to close
                  </p>
                </VStack>
              </VStack>
            </PopoverContent>
          </Popover>
        )}

        <HStack gap={2} align="center" className="flex-1 min-w-0">
          {card.collector_number && (
            <span className="text-[11px] font-mono text-muted-foreground flex-shrink-0">
              #{card.collector_number}
            </span>
          )}
          <span
            className={cn("text-sm font-light truncate", {
              "text-foreground": !outOfStock,
              "text-muted-foreground": outOfStock,
            })}
          >
            {card.name}
          </span>
          {card.stock !== null && (
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                outOfStock
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {card.stock}
            </span>
          )}
        </HStack>

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
      </HStack>

      {expanded && (
        <VStack gap={0}>
          {isLoading ? (
            <HStack
              gap={3}
              align="center"
              className="px-4 py-2.5 bg-background/50"
              style={{ paddingLeft: `${variantPaddingLeft}px` }}
            >
              <HStack gap={2} align="center">
                <div className="w-3 h-3 border-2 border-muted border-t-foreground rounded-full animate-spin"></div>
                <span className="text-xs text-muted-foreground">
                  Loading variants...
                </span>
              </HStack>
            </HStack>
          ) : stockVariants && stockVariants.length > 0 ? (
            stockVariants.map((stock: UserStockWithListings) => (
              <CardVariantRow
                key={stock.stock_id}
                stock={stock}
                cardId={card.id}
                paddingLeft={variantPaddingLeft}
              />
            ))
          ) : (
            <HStack
              gap={3}
              align="center"
              className="px-4 py-2.5 bg-background/50"
              style={{ paddingLeft: `${variantPaddingLeft}px` }}
            >
              <span className="text-xs text-muted-foreground">
                No variants available
              </span>
            </HStack>
          )}
        </VStack>
      )}

      <AddStockDialog
        open={addStockDialogOpen}
        onOpenChangeAction={setAddStockDialogOpen}
        cardId={card.id}
        cardName={card.name}
      />
    </VStack>
  );
}
