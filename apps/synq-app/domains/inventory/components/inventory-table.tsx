/**
 * The tree table fetches the data client side. This is done so it fetches only the data when a row is expanded since the table handles large amount of data.
 * Supabase provides unlimited API requests, so we use this in our benefit.
 * This is achieved by using react-query, by enabling fetch on expand.
 */

"use client";

// Core
import Link from "next/link";
// Components
import { Summary } from "./tree-table/summary";
import { LibraryRow } from "./tree-table/library-row";
import { Library } from "lucide-react";
// Services
import { CoreLibrary } from "@synq/supabase/services";

export default function InventoryTable({
  libraries,
}: {
  libraries: Array<Pick<CoreLibrary, "id" | "name"> & { stock: number }>;
}) {
  return (
    <div className="w-full h-full bg-background flex flex-col">
      {/* Tree Table */}
      <div className="flex-1 overflow-auto">
        {libraries.length > 0 ? (
          libraries.map((lib) => <LibraryRow key={lib.id} library={lib} />)
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

      {/* Summary - Lower Bar */}
      <Summary />
    </div>
  );
}
