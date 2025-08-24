// Components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Button,
} from "@synq/ui/component";
import { ShoppingCart, Search, Siren } from "lucide-react";

interface StockActionsProps {
  stockId: string;
  cardId: string;
  size?: "sm" | "md";
}

export default function StockActions({
  stockId,
  cardId,
  size = "md",
}: StockActionsProps) {
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const buttonSize = size === "sm" ? "w-6 h-6" : "w-8 h-8";

  return (
    <div className="flex gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center justify-center ${buttonSize} hover:bg-accent rounded transition-colors`}
              onClick={() => console.log("Add to cart:", stockId)}
              aria-label="Add to cart"
            >
              <ShoppingCart className={`${iconSize} `} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add to cart</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={`flex items-center justify-center ${buttonSize} hover:bg-accent rounded transition-colors`}
              onClick={() => window.open(`/inventory/item/${cardId}`, "_blank")}
              aria-label="See card"
            >
              <Search className={`${iconSize}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View card details</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center justify-center ${buttonSize} hover:bg-accent rounded transition-colors`}
              onClick={() => console.log("Set alert:", stockId)}
              aria-label="Set alert"
            >
              <Siren
                className={`${iconSize} text-orange-500 hover:text-orange-600`}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Set price alert</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
