/**
 * The tree table fetches the data client side. This is done so it fetches only the data when a row is expanded since the table handles large amount of data.
 * Supabase provides unlimited API requests, so we use this in our benefit.
 * This is achieved by using react-query, by enabling fetch on expand.
 */

"use client";
// Core
import { useState } from "react";
// Components
import InventoryTableSkeleton from "./inventory-table-skeleton";
import { LibraryRow } from "./library-row/library-row";
import InventoryTableFilters, {
  StockFilterType,
} from "./inventory-table-filters";
import InventoryTableSearchResults from "./inventory-table-search-results";
// Services
import { InventoryService } from "@synq/supabase/services";
import { useQuery } from "@tanstack/react-query";
import { InventoryTableSummary } from "./inventory-table-summary";

export default function InventoryTable() {
  const [stockFilter, setStockFilter] = useState<StockFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allLibraries = [], isLoading } = useQuery({
    queryKey: ["libraries", stockFilter],
    queryFn: () =>
      InventoryService.getUserCoreLibrary("client", {
        offset: 0,
        limit: 1000,
        stockFilter,
      }),
    staleTime: 0,
  });

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 bg-muted border-b">
        <InventoryTableFilters
          onChange={setStockFilter}
          isLoading={isLoading}
          onSearchChange={setSearchQuery}
        />
      </div>
      {isLoading && <InventoryTableSkeleton />}

      <div className="flex-1 overflow-auto">
        {searchQuery ? (
          <InventoryTableSearchResults
            query={searchQuery}
            options={{ stockFilter }}
          />
        ) : allLibraries.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <p>No items in your inventory.</p>
          </div>
        ) : (
          allLibraries.map((lib) => (
            <LibraryRow key={lib.id} library={lib} stockFilter={stockFilter} />
          ))
        )}
      </div>

      <InventoryTableSummary />
    </div>
  );
}
