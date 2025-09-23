/**
 * The tree table fetches the data client side. This is done so it fetches only the data when a row is expanded since the table handles large amount of data.
 * Supabase provides unlimited API requests, so we use this in our benefit.
 * This is achieved by using react-query, by enabling fetch on expand.
 */

"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Summary } from "./tree-table/summary";
import { LibraryRow } from "./tree-table/library-row";
import { Library } from "lucide-react";
import { InventoryService, CoreLibrary } from "@synq/supabase/services";

const LIBRARIES_PER_BATCH = 10;

export default function InventoryTable({
  libraries: initialLibraries,
}: {
  libraries: Array<Pick<CoreLibrary, "id" | "name"> & { stock: number | null }>;
}) {
  const [allLibraries, setAllLibraries] = useState(initialLibraries);
  const [offset, setOffset] = useState(initialLibraries.length);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialLibraries.length >= LIBRARIES_PER_BATCH,
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const newLibraries = await InventoryService.getUserCoreLibrary("client", {
        offset,
        limit: LIBRARIES_PER_BATCH,
      });

      if (
        newLibraries.length === 0 ||
        newLibraries.length < LIBRARIES_PER_BATCH
      ) {
        setHasMore(false);
      }

      setAllLibraries((prev) => [...prev, ...newLibraries]);
      setOffset((prev) => prev + newLibraries.length);
    } catch (error) {
      console.error("Error loading more libraries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 200;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMore();
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore]);

  return (
    <div className="w-full h-full bg-background flex flex-col">
      <div ref={scrollContainerRef} className="flex-1 overflow-auto">
        {allLibraries.length > 0 ? (
          <>
            {allLibraries.map((lib) => (
              <LibraryRow key={lib.id} library={lib} />
            ))}

            {isLoading && (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                  <span className="text-sm">Loading more libraries...</span>
                </div>
              </div>
            )}

            {!hasMore && allLibraries.length > LIBRARIES_PER_BATCH && (
              <div className="text-center py-4 text-sm text-muted-foreground border-t bg-muted/20">
                All {allLibraries.length} libraries loaded
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
            <Library className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              No items in your inventory
            </h3>
            <p className="text-sm">
              You don&apos;t have any stock yet. Start by adding cards to your
              library.
            </p>
            <Link
              href="/library"
              className="mt-2 px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 transition"
            >
              Add New Card
            </Link>
          </div>
        )}
      </div>
      <Summary />
    </div>
  );
}
