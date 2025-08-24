/**
 * The tree table fetches the data client side. This is done so it fetches only the data when a row is expanded since the table handles large amount of data.
 * Supabase provides unlimited API requests, so we use this in our benefit.
 * This is achieved by using react-query, by enabling fetch on expand.
 */

"use client";

// Components
import { Summary } from "./tree-table/summary";
import { LibraryRow } from "./tree-table/library-row";

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
          <div className="p-8 text-center text-foreground">
            {/* TODO: Implement Placeholder Design */}
            {"No items to display"}
          </div>
        )}
      </div>

      {/* Summary - Lower Bar */}
      <Summary />
    </div>
  );
}
