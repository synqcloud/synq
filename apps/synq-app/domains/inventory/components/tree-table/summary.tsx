import React from "react";

import { VStack, HStack } from "@synq/ui/component";

// interface SummaryProps {
//   totals: {
//     items: number;
//     quantity: number;
//     value: number;
//     stockItems: number;
//     outOfStockItems: number;
//     totalItems: number;
//   };
// }

export function Summary() {
  return (
    <div className="p-4 bg-muted border-t text-sm font-light tracking-[-0.01em]">
      <VStack gap={4} className="sm:flex-row sm:justify-between">
        <HStack gap={4} className="flex-col sm:flex-row">
          {/*<span>Items: {totals.items}</span>*/}
        </HStack>

        <HStack gap={4}>
          {/*<span>Stock Qty: {totals.quantity}</span>*/}
          {/*<span className="font-medium">Value: ${totals.value.toFixed(2)}</span>*/}
        </HStack>
      </VStack>
    </div>
  );
}
