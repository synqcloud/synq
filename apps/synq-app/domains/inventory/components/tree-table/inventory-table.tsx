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
import SetRow from "./set-row/set-row";
import CardRow from "./card-row/card-row";
import InventoryTableFilters, {
  StockFilterType,
  GroupByType,
} from "./inventory-table-filters";
import InventoryTableSearchResults from "./inventory-table-search-results";
// Services
import { InventoryService } from "@synq/supabase/services";
import { useQuery } from "@tanstack/react-query";
import { InventoryTableSummary } from "./inventory-table-summary";

export default function InventoryTable() {
  const [stockFilter, setStockFilter] = useState<StockFilterType>("all");
  const [groupBy, setGroupBy] = useState<GroupByType>("game");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data based on groupBy
  const { data: libraries = [], isLoading: librariesLoading } = useQuery({
    queryKey: ["libraries", stockFilter],
    queryFn: () =>
      InventoryService.getUserCoreLibrary("client", {
        offset: 0,
        limit: 1000,
        stockFilter,
      }),
    enabled: groupBy === "game",
    staleTime: 0,
  });

  const { data: sets = [], isLoading: setsLoading } = useQuery({
    queryKey: ["all-sets", stockFilter],
    queryFn: () =>
      InventoryService.fetchSetsByLibrary("client", null, {
        offset: 0,
        limit: 1000,
        stockFilter,
      }),
    enabled: groupBy === "set",
    staleTime: 0,
  });

  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["all-cards", stockFilter],
    queryFn: () =>
      InventoryService.fetchCardsBySet("client", null, {
        offset: 0,
        limit: 1000,
        stockFilter,
      }),
    enabled: groupBy === "card",
    staleTime: 0,
  });

  const isLoading = librariesLoading || setsLoading || cardsLoading;

  // Render content based on groupBy
  const renderContent = () => {
    if (searchQuery) {
      return (
        <InventoryTableSearchResults
          query={searchQuery}
          options={{ stockFilter: "all" }}
        />
      );
    }

    if (isLoading) {
      return <InventoryTableSkeleton />;
    }

    // Group by Game (Library -> Set -> Card)
    if (groupBy === "game") {
      if (libraries.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <p>No items in your inventory.</p>
          </div>
        );
      }
      return libraries.map((lib) => (
        <LibraryRow key={lib.id} library={lib} stockFilter={stockFilter} />
      ));
    }

    // Group by Set (Set -> Card)
    if (groupBy === "set") {
      if (sets.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <p>No sets in your inventory.</p>
          </div>
        );
      }
      return sets.map((set) => (
        <SetRow key={set.id} set={set} stockFilter={stockFilter} />
      ));
    }

    // Group by Card (just cards, no hierarchy)
    if (groupBy === "card") {
      if (cards.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <p>No cards in your inventory.</p>
          </div>
        );
      }
      return cards.map((card) => (
        <CardRow key={card.id} card={card} hasAlert={false} />
      ));
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="p-4 bg-muted border-b">
        <InventoryTableFilters
          onChange={setStockFilter}
          onGroupByChange={setGroupBy}
          isLoading={isLoading}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="flex-1 overflow-auto">{renderContent()}</div>

      {/*<InventoryTableSummary />*/}
    </div>
  );
}
