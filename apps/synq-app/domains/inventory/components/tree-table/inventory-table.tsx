/**
 * The tree table fetches the data client side. This is done so it fetches only the data when a row is expanded since the table handles large amount of data.
 * Supabase provides unlimited API requests, so we use this in our benefit.
 * This is achieved by using react-query, by enabling fetch on expand.
 */
"use client";
// Core
import { useState, useEffect } from "react";
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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Button,
  Kbd,
} from "@synq/ui/component";
import { Package, Search } from "lucide-react";
// Services
import { InventoryService } from "@synq/supabase/services";
import { useQuery } from "@tanstack/react-query";
import { InventoryTableSummary } from "./inventory-table-summary";
import { SearchCommand } from "@/shared/command/search-command";

export default function InventoryTable() {
  const [stockFilter, setStockFilter] = useState<StockFilterType>("all");
  const [groupBy, setGroupBy] = useState<GroupByType>("game");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut for search (Cmd+P or Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          <div className="flex items-center justify-center h-full p-4">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package />
                </EmptyMedia>
                <EmptyTitle>No items in your inventory</EmptyTitle>
                <EmptyDescription>
                  Start by adding cards to your collection
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setSearchOpen(true)} className="gap-2">
                  <Search className="h-4 w-4" />
                  Search cards
                  <div className="hidden items-center gap-1 sm:flex">
                    <Kbd>⌘ + P</Kbd>
                  </div>
                </Button>
              </EmptyContent>
            </Empty>
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
          <div className="flex items-center justify-center h-full p-4">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package />
                </EmptyMedia>
                <EmptyTitle>No sets in your inventory</EmptyTitle>
                <EmptyDescription>
                  Start by adding cards to your collection
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setSearchOpen(true)} className="gap-2">
                  <Search className="h-4 w-4" />
                  Search cards
                  <div className="hidden items-center gap-1 sm:flex">
                    <Kbd>⌘ + P</Kbd>
                  </div>
                </Button>
              </EmptyContent>
            </Empty>
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
          <div className="flex items-center justify-center h-full p-4">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package />
                </EmptyMedia>
                <EmptyTitle>No cards in your inventory</EmptyTitle>
                <EmptyDescription>
                  Start by adding cards to your collection
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setSearchOpen(true)} className="gap-2">
                  <Search className="h-4 w-4" />
                  Search cards
                  <div className="hidden items-center gap-1 sm:flex">
                    <Kbd>⌘ + P</Kbd>
                  </div>
                </Button>
              </EmptyContent>
            </Empty>
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
    <>
      <div className="flex flex-col h-full w-full relative">
        <div className="p-4 bg-muted border-b">
          <InventoryTableFilters
            onChangeAction={setStockFilter}
            onGroupByChangeAction={setGroupBy}
            isLoading={isLoading}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="flex-1 overflow-auto">{renderContent()}</div>

        {/*<InventoryTableSummary />*/}
      </div>

      {/* Search Command */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
