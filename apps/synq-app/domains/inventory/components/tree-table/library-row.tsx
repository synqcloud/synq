import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import SetRow from "./set-row";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CoreLibrary, InventoryService } from "@synq/supabase/services";
import { StockFilterType } from "../inventory-table-filters";

const SETS_PER_BATCH = 44;

export function LibraryRow({
  library,
  stockFilter,
}: {
  library: Pick<CoreLibrary, "id" | "name"> & { stock: number | null };
  stockFilter: StockFilterType;
}) {
  const [expanded, setExpanded] = useState(true);
  const [allSets, setAllSets] = useState<
    Array<{
      id: string;
      name: string;
      stock: number | null;
      is_upcoming: boolean;
    }>
  >([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollObserverRef = useRef<HTMLDivElement>(null);

  const queryKey = expanded
    ? ["sets", library.id, expanded, stockFilter]
    : ["sets", library.id, "disabled", stockFilter];

  const { data: initialSets } = useQuery({
    queryKey,
    queryFn: () =>
      InventoryService.fetchSetsByLibrary("client", library.id, {
        offset: 0,
        limit: SETS_PER_BATCH,
        stockFilter,
      }),
    enabled: expanded,
    staleTime: 0,
  });

  // Reset when expanding/collapsing or stockFilter changes
  useEffect(() => {
    setAllSets([]);
    setOffset(0);
    setHasMore(true);
    setIsLoading(false);
  }, [expanded, stockFilter]);

  // Populate first batch
  useEffect(() => {
    if (expanded && initialSets && allSets.length === 0) {
      setAllSets(initialSets);
      setOffset(initialSets.length);
      setHasMore(initialSets.length >= SETS_PER_BATCH);
    }
  }, [expanded, initialSets, allSets.length]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !expanded) return;

    setIsLoading(true);
    try {
      const newSets = await InventoryService.fetchSetsByLibrary(
        "client",
        library.id,
        { offset, limit: SETS_PER_BATCH, stockFilter },
      );
      if (newSets.length === 0 || newSets.length < SETS_PER_BATCH) {
        setHasMore(false);
      }
      setAllSets((prev) => [...prev, ...newSets]);
      setOffset((prev) => prev + newSets.length);
    } catch (error) {
      console.error("Error loading more sets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, expanded, library.id, offset, stockFilter]);

  // Infinite scroll observer
  useEffect(() => {
    if (!expanded || !hasMore || isLoading || allSets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) loadMore();
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    const node = scrollObserverRef.current;
    if (node) observer.observe(node);

    return () => observer.disconnect();
  }, [expanded, hasMore, isLoading, allSets.length, offset, loadMore]);

  return (
    <div key={library.id}>
      <div
        className="flex items-center px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground" />
        )}
        <span className="flex-1 font-light text-lg text-foreground">
          {library.name}
          {library.stock !== null && (
            <span className="ml-2 px-1.5 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded">
              {library.stock}
            </span>
          )}
          {library.stock === 0 && (
            <span className="ml-1 text-xs text-red-500">(Out of Stock)</span>
          )}
        </span>
      </div>

      {expanded && (
        <div>
          {allSets.map((set) => (
            <SetRow key={set.id} set={set} stockFilter={stockFilter} />
          ))}

          {isLoading && (
            <div className="flex items-center justify-center py-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-muted border-t-foreground rounded-full animate-spin"></div>
                <span className="text-xs">Loading more sets...</span>
              </div>
            </div>
          )}

          {hasMore && !isLoading && allSets.length > 0 && (
            <div ref={scrollObserverRef} className="h-1" />
          )}

          {!hasMore && allSets.length > SETS_PER_BATCH && (
            <div className="text-center py-2 text-xs text-muted-foreground">
              All {allSets.length} sets loaded
            </div>
          )}
        </div>
      )}
    </div>
  );
}
