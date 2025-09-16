import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Siren } from "lucide-react";
import { Button } from "@synq/ui/component";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@synq/ui/component";
import { PriceService } from "@synq/supabase/services";

interface PriceAlertButtonProps {
  cardId: string;
  className?: string;
}

export default function PriceAlertButton({
  cardId,
  className,
}: PriceAlertButtonProps) {
  const queryClient = useQueryClient();

  // Query to check if user has price alert for this card
  const { data: hasAlert = false } = useQuery({
    queryKey: ["price-alert", cardId],
    queryFn: () => PriceService.hasUserPriceAlert(cardId, "client"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Mutation to toggle price alert
  const toggleAlertMutation = useMutation({
    mutationFn: async () => {
      if (hasAlert) {
        return PriceService.removePriceAlert(cardId, "client");
      } else {
        return PriceService.addPriceAlert(cardId, "client");
      }
    },
    onSuccess: () => {
      // Optimistically update the query data
      queryClient.setQueryData(["price-alert", cardId], !hasAlert);
    },
    onError: (error) => {
      console.error("Failed to toggle price alert:", error);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ["price-alert", cardId] });
    },
  });

  // Toggle price alert handler
  const handleToggleAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleAlertMutation.mutate();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 hover:bg-accent/70 transition-colors ${className}`}
            onClick={handleToggleAlert}
            disabled={toggleAlertMutation.isPending}
          >
            <Siren
              className={`h-4 w-4 transition-colors ${
                hasAlert
                  ? "text-amber-500 fill-amber-500"
                  : "text-muted-foreground hover:text-amber-400"
              } ${toggleAlertMutation.isPending ? "opacity-50" : ""}`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            {hasAlert ? (
              <div>
                <p className="font-medium">Price alert is active</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll be notified daily when this card's price changes
                  (increases or decreases). Click to remove alert.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium">Set price alert</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Get daily notifications when this card's price changes. We'll
                  check prices every 24 hours and alert you of any increases or
                  decreases.
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
