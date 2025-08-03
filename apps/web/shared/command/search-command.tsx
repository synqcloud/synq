"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@synq/ui/component";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDebounce } from "@/hooks/use-debounce";
// import { UserService } from "@synq/supabase/services";
// import { createClient } from "@synq/supabase/client";
// import { CollectionItem, Collection } from "@synq/supabase/types";
import { FileSearch, Loader2, AlertCircle } from "lucide-react";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchResultItem = {
  id: string;
  name: string;
  image_url?: string;
  collection_id: string;
  collection: {
    id: string;
    name: string;
    parent_collection_id?: string;
  } | null;
};

interface GroupedResults {
  [collectionId: string]: {
    collectionName: string;
    items: SearchResultItem[];
  };
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  // const supabase = createClient();

  useEffect(() => {
    setError(null);
    if (!debouncedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }

    async function fetchResults() {
      setLoading(true);
      setError(null);
      try {
        // TODO: Implement backend search logic
        // const user = await UserService.getCurrentUser('client');
        // if (!user) {
        //   setError("You must be logged in to search");
        //   setResults([]);
        //   return;
        // }

        // const { data, error: dbError } = await supabase
        //   .from("user_collection_items")
        //   .select(
        //     `
        //     id,
        //     name,
        //     image_url,
        //     collection_id,
        //     collection:user_collections (
        //       id,
        //       name,
        //       parent_collection_id
        //     )
        //   `,
        //   )
        //   .eq("user_id", user.id)
        //   .ilike("name", `%${debouncedQuery}%`)
        //   .limit(10);

        // Mock data for development
        const mockResults: SearchResultItem[] = [
          {
            id: "item-1",
            name: "Charizard VMAX",
            image_url:
              "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=600&fit=crop",
            collection_id: "collection-1",
            collection: {
              id: "collection-1",
              name: "Pokemon TCG",
              parent_collection_id: undefined,
            },
          },
          {
            id: "item-2",
            name: "Black Lotus",
            image_url:
              "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=600&fit=crop",
            collection_id: "collection-2",
            collection: {
              id: "collection-2",
              name: "Magic: The Gathering",
              parent_collection_id: undefined,
            },
          },
        ].filter((item) =>
          item.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
        );

        setResults(mockResults);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        console.error("Search fetch failed:", message);
        setError(message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [debouncedQuery]);

  const groupedResults = useMemo(() => {
    return results.reduce<GroupedResults>((acc, item) => {
      if (!item.collection) return acc;
      const collectionId = item.collection.id;
      if (!acc[collectionId]) {
        acc[collectionId] = {
          collectionName: item.collection.name,
          items: [],
        };
      }
      acc[collectionId].items.push(item);
      return acc;
    }, {});
  }, [results]);

  const runCommand = useCallback(
    (command: () => unknown) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  const handleSelect = (item: SearchResultItem) => {
    runCommand(() => {
      const collectionId =
        item.collection?.parent_collection_id || item.collection_id;
      router.push(`/collection/${collectionId}/item/${item.id}`);
    });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <h2>Search Collection Items</h2>
      </VisuallyHidden>
      <CommandInput
        placeholder="Search for a card..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
            Searching...
          </div>
        )}
        {error && (
          <div className="p-4 text-center text-sm text-destructive">
            <AlertCircle className="h-4 w-4 inline-block mr-2" />
            {error}
          </div>
        )}
        {!loading && !error && results.length === 0 && debouncedQuery && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        {!loading &&
          !error &&
          Object.keys(groupedResults).length > 0 &&
          Object.entries(groupedResults).map(([collectionId, group]) => (
            <CommandGroup
              key={collectionId}
              heading={group.collectionName}
              className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-foreground [&_[cmdk-group-heading]]:text-sm border-b border-border/40"
            >
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${group.collectionName} ${item.name}`}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center gap-2 cursor-pointer pl-6 pr-2 py-2 hover:bg-accent/50 data-[selected=true]:bg-accent/50"
                >
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="rounded object-cover h-8 w-8 border flex-shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 flex items-center justify-center bg-muted rounded border flex-shrink-0">
                      <FileSearch className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.collection && (
                      <span className="text-xs text-muted-foreground">
                        {item.collection.name}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
      </CommandList>
    </CommandDialog>
  );
}
