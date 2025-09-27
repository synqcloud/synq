// Components
import {
  Sheet,
  SheetContent,
  Button,
  Badge,
  Separator,
  SheetTitle,
  HStack,
  VStack,
} from "@synq/ui/component";
import { ChevronLeft } from "lucide-react";
import { TransactionItemsDisplay } from "./transaction-items-display";
import { MarketplaceIcon } from "@/shared/icons/marketplace-icon";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
// Hooks
import { useIsMobile } from "@synq/ui/hooks";
// Utils
import { formatCurrency } from "@/shared/utils/format-currency";
import { cn } from "@synq/ui/utils";
// Services
import { UserTransaction } from "@synq/supabase/services";
import { useCurrency } from "@/shared/contexts/currency-context";

interface TransactionTableSheetProps {
  order: UserTransaction & { total_quantity: number };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionTableSheet({
  order,
  isOpen,
  onOpenChange,
}: TransactionTableSheetProps) {
  const isMobile = useIsMobile();
  const { currency } = useCurrency();

  // Status styling functions
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "IN_PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        showCloseButton={false}
        className="sm:max-w-[550px] flex flex-col h-full p-0"
      >
        {/* Hidden title for accessibility */}
        <VisuallyHidden>
          <SheetTitle>Order Details</SheetTitle>
        </VisuallyHidden>

        {/* Minimal Header */}
        <div className="px-6 py-4 mt-1 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
                  onClick={() => onOpenChange(false)}
                >
                  <ChevronLeft />
                </Button>
              </div>
              <div>
                <Badge variant="outline">{order.transaction_type}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Minimalist Details */}
          <VStack gap={5} className="px-6 py-6">
            {/* Clean Property List */}
            <VStack gap={4}>
              {/* Status */}
              <HStack justify="between" align="center" className="py-1">
                <span className="text-sm text-muted-foreground w-20">
                  Status
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    getOrderStatusColor(order.transaction_status),
                  )}
                >
                  {getOrderStatusLabel(order.transaction_status)}
                </Badge>
              </HStack>

              {/* Source */}
              <HStack justify="between" align="center" className="py-1">
                <span className="text-sm text-muted-foreground w-20">
                  Source
                </span>
                <MarketplaceIcon
                  marketplace={order.source || "Manual"}
                  isIntegration={order.is_integration}
                />
              </HStack>
            </VStack>

            <Separator />

            {/* Financial Summary - Clean */}
            <VStack gap={2}>
              <HStack justify="between" className="text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {formatCurrency(order.subtotal_amount ?? 0, currency)}
                </span>
              </HStack>
              <HStack justify="between" className="text-sm">
                <span className="text-muted-foreground">Fees</span>
                <span className="text-muted-foreground">
                  -
                  {formatCurrency(
                    (order.subtotal_amount ?? 0) - (order.net_amount ?? 0),
                    currency,
                  )}
                </span>
              </HStack>
              <Separator />
              <HStack justify="between" className="text-base font-medium">
                <span>Net Amount</span>
                <span>{formatCurrency(order.net_amount ?? 0, currency)}</span>
              </HStack>
            </VStack>
          </VStack>

          <Separator />

          {/* Items Section */}
          <VStack gap={4} className="px-6 py-6">
            <HStack justify="between" align="center">
              <h3 className="text-sm font-medium">Items</h3>
              <span className="text-xs text-muted-foreground">
                {order.total_quantity}
              </span>
            </HStack>

            <TransactionItemsDisplay
              orderId={order.id}
              isOpen={isOpen}
              isIntegration={order.is_integration}
            />
          </VStack>
        </div>
      </SheetContent>
    </Sheet>
  );
}
