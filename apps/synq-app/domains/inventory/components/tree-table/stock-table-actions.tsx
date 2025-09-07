// Components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Button,
} from "@synq/ui/component";
import { Search } from "lucide-react";

interface StockTableActionsProps {
  cardId: string;
  size?: "sm" | "md";
}

export function StockTableActions({
  cardId,
  size = "md",
}: StockTableActionsProps) {
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <div className="flex gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
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
      </TooltipProvider>
    </div>
  );
}
