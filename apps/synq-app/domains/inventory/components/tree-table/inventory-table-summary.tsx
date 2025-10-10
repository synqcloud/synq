import React from "react";

import { VStack, HStack, Skeleton } from "@synq/ui/component";
import { useCurrency } from "@/shared/contexts/currency-context";
import { formatCurrency } from "@/shared/utils/format-currency";
import { useQuery } from "@tanstack/react-query";
import { InventoryService } from "@synq/supabase/services";
import { TcgplayerIcon } from "@/shared/icons/icons";

export function InventoryTableSummary() {
  const { currency } = useCurrency();

  const {
    data: summaryData = {
      total_items: 0,
      total_stock: 0,
      total_inventory_value: 0,
    },
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["inventory-table-summary"],
    queryFn: () => InventoryService.fetchInventoryTableSummary("client"),
  });

  if (isLoading) {
    return (
      <div className="p-4 bg-muted border-t text-sm font-light tracking-[-0.01em]">
        <VStack gap={4} className="sm:flex-row sm:justify-between">
          <HStack gap={4} className="flex-col sm:flex-row ml-4">
            <Skeleton className="h-4 w-40" />
          </HStack>
          <HStack gap={4} className="mr-10">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </HStack>
        </VStack>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-600">
        Error loading summary: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted border-t text-sm font-light tracking-[-0.01em]">
      <VStack gap={4} className="sm:flex-row sm:justify-between" align="center">
        <HStack gap={4} className="flex-col sm:flex-row ml-4">
          <span className="text-primary">
            Total: {summaryData.total_items} items
          </span>
        </HStack>

        <HStack gap={4} align="center">
          <span>Total stock: {summaryData.total_stock}</span>
          <HStack
            align="center"
            gap={1.5}
            className="border rounded-md px-1.5 py-1"
          >
            <TcgplayerIcon className="h-4 w-4" />
            <span className="font-medium">
              Total Value:{" "}
              {formatCurrency(summaryData.total_inventory_value || 0, currency)}
            </span>
          </HStack>
        </HStack>
      </VStack>
    </div>
  );
}
