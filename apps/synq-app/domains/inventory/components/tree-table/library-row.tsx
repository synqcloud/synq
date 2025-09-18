import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import SetRow from "./set-row";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CoreLibrary, InventoryService } from "@synq/supabase/services";

const SETS_PER_BATCH = 24;

export function LibraryRow({
  library,
}: {
  library: Pick<CoreLibrary, "id" | "name"> & { stock: number };
}) {
  const [expanded, setExpanded] = useState(false);
  const [allSets, setAllSets] = useState<
    Array<{ id: string; name: string; stock: number }>
  >([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollObserverRef = useRef<HTMLDivElement>(null);

  const queryKey = expanded
    ? ["sets", library.id, expanded]
    : ["sets", library.id, "disabled"];

  const {
    data: initialSets,
    isFetched,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () =>
      InventoryService.fetchSetsByLibrary("client", library.id, {
        offset: 0,
        limit: SETS_PER_BATCH,
      }),
    enabled: expanded,
    staleTime: 0,
  });

  // Reset & refetch when expanding/collapsing
  useEffect(() => {
    if (expanded) {
      setAllSets([]);
      setOffset(0);
      setHasMore(true);
      setIsLoading(false);
      if (isFetched) refetch();
    } else {
      setAllSets([]);
      setOffset(0);
      setHasMore(true);
    }
  }, [expanded, isFetched, refetch]);

  // Populate first batch
  useEffect(() => {
    if (expanded && isFetched && initialSets) {
      setAllSets(initialSets);
      setOffset(initialSets.length);
      setHasMore(initialSets.length >= SETS_PER_BATCH);
    }
  }, [expanded, isFetched, initialSets]);

  // ✅ stable loadMore function
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !expanded) return;

    setIsLoading(true);
    try {
      const newSets = await InventoryService.fetchSetsByLibrary(
        "client",
        library.id,
        { offset, limit: SETS_PER_BATCH },
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
  }, [isLoading, hasMore, expanded, library.id, offset]);

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
        className="flex items-center px-4 py-2 cursor-pointer hover:bg-accent bg-muted font-light tracking-[-0.01em]"
        style={{ paddingLeft: `${16 + 0 * 24}px` }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 mr-2" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2" />
        )}
        <span className="flex-1">
          {library.name} ({library.stock})
        </span>
      </div>

      {expanded && (
        <>
          {allSets.map((set) => (
            <SetRow key={set.id} set={set} />
          ))}

          {isLoading && (
            <div
              className="flex items-center justify-center py-3 text-muted-foreground"
              style={{ paddingLeft: `${16 + 1 * 24}px` }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                <span className="text-xs">Loading more sets...</span>
              </div>
            </div>
          )}

          {hasMore && !isLoading && allSets.length > 0 && (
            <div
              ref={scrollObserverRef}
              className="h-1"
              style={{ paddingLeft: `${16 + 1 * 24}px` }}
            />
          )}

          {!hasMore && allSets.length > SETS_PER_BATCH && (
            <div
              className="text-center py-2 text-xs text-muted-foreground bg-muted/20"
              style={{ paddingLeft: `${16 + 1 * 24}px` }}
            >
              All {allSets.length} sets loaded
            </div>
          )}
        </>
      )}
    </div>
  );
}
