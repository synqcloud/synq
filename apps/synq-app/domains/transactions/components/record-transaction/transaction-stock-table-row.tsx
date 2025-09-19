// Core
import { useCallback, useMemo } from "react";
import { Plus } from "lucide-react";

// Components
import {
  HStack,
  VStack,
  Button,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@synq/ui/component";

// Services
import { UserStockWithListings } from "@synq/supabase/services";
import { MarketplaceIcon } from "../marketplace-icon";
import { useCurrency } from "@/shared/contexts/currency-context";

type StockTableRowProps = {
  stock: UserStockWithListings;
  onAddToTransactionAction?: (stockId: string) => void;
};

export default function TransactionStockTableRow({
  stock,
  onAddToTransactionAction,
}: StockTableRowProps) {
  // Memoize the click handler to prevent function recreation
  const handleAddToTransaction = useCallback(() => {
    onAddToTransactionAction?.(stock.id);
  }, [onAddToTransactionAction, stock.id]);

  // Memoize condition color to prevent recalculation
  const conditionColor = useMemo(
    () => getConditionColor(stock.condition),
    [stock.condition],
  );

  // Memoize formatted cost
  const formattedCost = useMemo(
    () => (stock.cogs ? `${stock.cogs.toFixed(2)}` : "-"),
    [stock.cogs],
  );

  // Memoize the padding style to match the header
  const paddingStyle = useMemo(
    () => ({
      paddingLeft: `${64 + 3 * 24}px`,
      paddingRight: "16px", // Match the px-4 right padding
    }),
    [],
  );

  // Memoize grid style to match header
  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns:
        "minmax(50px, auto) minmax(40px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(60px, 1fr) minmax(80px, 1.5fr) minmax(80px, 1.5fr) minmax(120px, 2fr)",
    }),
    [],
  );

  const { symbol } = useCurrency();

  return (
    <div className="bg-background w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div
          className="py-2 border-b border-border w-full"
          style={paddingStyle}
        >
          <div
            className="grid gap-2 text-sm items-center w-full"
            style={gridStyle}
          >
            {/* Add Action Button */}
            {onAddToTransactionAction && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddToTransaction}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Add to transaction
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Quantity */}
            <span className="font-medium">{stock.quantity || "-"}</span>

            {/* Language */}
            <span>{stock.language || "-"}</span>

            {/* Condition */}
            <span className={conditionColor}>{stock.condition || "-"}</span>

            {/* Cost */}
            <span className="text-accent-foreground">
              {symbol}
              {formattedCost}
            </span>

            {/* SKU */}
            <span>{stock.sku || "-"}</span>

            {/* Location */}
            <span>{stock.location || "-"}</span>

            {/* Marketplaces */}
            <HStack gap={2}>
              {stock.marketplaces.map((m: string) => (
                <MarketplaceIcon
                  key={m}
                  marketplace={m}
                  isIntegration={false}
                  showLabel={false}
                />
              ))}
            </HStack>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="px-4 py-3 border-b border-border">
          <VStack gap={3}>
            {/* Add Action Button - Top of mobile view */}
            {onAddToTransactionAction && (
              <HStack justify="start" align="center">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddToTransaction}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Add to transaction
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </HStack>
            )}

            {/* First row: Quantity, Language, Condition */}
            <HStack justify="between" align="center">
              <HStack gap={4} align="center">
                <VStack>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Qty
                  </span>
                  <span className="font-medium">{stock.quantity || "-"}</span>
                </VStack>
                <VStack>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Language
                  </span>
                  <span className="text-sm">{stock.language || "-"}</span>
                </VStack>
                <VStack>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Condition
                  </span>
                  <span className={conditionColor}>
                    {stock.condition || "-"}
                  </span>
                </VStack>
              </HStack>
            </HStack>

            {/* Second row: SKU, Location */}
            <HStack justify="between" align="center">
              <HStack gap={4} align="center">
                <VStack>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    SKU
                  </span>
                  <span className="text-sm">{stock.sku || "-"}</span>
                </VStack>
                <VStack>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Location
                  </span>
                  <span className="text-sm">{stock.location || "-"}</span>
                </VStack>
              </HStack>
            </HStack>
          </VStack>
        </div>
      </div>
    </div>
  );
}

// Utility function
function getConditionColor(condition: string | null): string {
  if (!condition) return "";

  const conditionColors: Record<string, string> = {
    "near mint": "text-green-600",
    "lightly played": "text-yellow-600",
    played: "text-red-600",
  };

  return conditionColors[condition.toLowerCase()] || "";
}
