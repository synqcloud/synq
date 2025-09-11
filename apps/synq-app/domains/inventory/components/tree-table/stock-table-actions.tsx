import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Button,
} from "@synq/ui/component";
import { Edit3, Eye, PlusCircle, Trash2 } from "lucide-react";

interface StockTableActionsProps {
  cardId: string;
  onEdit?: () => void;
  onAddMarketplace?: () => void;
  onDelete?: () => void;
}

export function StockTableActions({
  cardId,
  onEdit,
  onAddMarketplace,
  onDelete,
}: StockTableActionsProps) {
  const actions = [
    {
      key: "edit",
      icon: Edit3,
      tooltip: "Edit stock",
      onClick: onEdit,
      visible: !!onEdit,
    },
    // {
    //   key: "view",
    //   icon: Eye,
    //   tooltip: "View card details",
    //   onClick: () => window.open(`/inventory/item/${cardId}`, "_blank"),
    //   visible: true,
    // },
    {
      key: "addMarketplace",
      icon: PlusCircle,
      tooltip: "Add marketplace",
      onClick: onAddMarketplace,
      visible: !!onAddMarketplace,
    },
    {
      key: "delete",
      icon: Trash2,
      tooltip: "Delete stock",
      onClick: onDelete,
      visible: !!onDelete,
    },
  ];

  return (
    <div className="flex gap-1">
      <TooltipProvider>
        {actions
          .filter((action) => action.visible)
          .map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.key}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={action.onClick}
                    aria-label={action.tooltip}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
      </TooltipProvider>
    </div>
  );
}
