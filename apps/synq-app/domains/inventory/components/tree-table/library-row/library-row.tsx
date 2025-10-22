import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import SetRow from "../set-row/set-row";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CoreLibrary, InventoryService } from "@synq/supabase/services";
import { StockFilterType } from "../inventory-table-filters";
import { HStack } from "@synq/ui/component";
import { formatCurrency } from "@/shared/utils/format-currency";
import { useCurrency } from "@/shared/contexts/currency-context";
import { TcgplayerIcon } from "@/shared/icons/icons";

const SETS_PER_BATCH = 44;

export function LibraryRow({
  library,
  stockFilter,
}: {
  library: Pick<CoreLibrary, "id" | "name"> & {
    stock: number | null;
    total_value: number | null;
  };
  stockFilter: StockFilterType;
}) {
  const [expanded, setExpanded] = useState(false);
  const [allSets, setAllSets] = useState<
    Array<{
      id: string;
      name: string;
      stock: number | null;
      is_upcoming: boolean;
      total_value: number | null;
    }>
  >([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollObserverRef = useRef<HTMLDivElement>(null);

  const { currency } = useCurrency();

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

  useEffect(() => {
    setAllSets([]);
    setOffset(0);
    setHasMore(true);
    setIsLoading(false);
  }, [expanded, stockFilter]);

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

  const outOfStock = library.stock === 0;

  return (
    <div key={library.id}>
      <div
        className="group flex items-center gap-3 px-4 py-3 cursor-pointer
          transition-all duration-150 ease-out bg-muted hover:bg-muted/80
          border-l-2 border-transparent hover:border-primary rounded-md"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
            {library.name}
          </span>
          {library.stock !== null && (
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                outOfStock
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted-foreground/10 text-foreground"
              }`}
            >
              {library.stock}
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="space-y-0.5">
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
