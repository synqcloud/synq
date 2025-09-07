"use client";

// Core
import { format } from "date-fns";
// Components
import { TableCell, TableRow, Button } from "@synq/ui/component";
import { StockUpdateWithCard } from "@synq/supabase/services";
import { Search } from "lucide-react";
// Utils
import { cn } from "@synq/ui/utils";

export function StockUpdateRow({ update }: { update: StockUpdateWithCard }) {
  const isPositive = update.quantity_change > 0;
  return (
    <TableRow
      className={cn(
        "group transition-colors cursor-pointer border-l-4 border-l-amber-500/40 hover:bg-amber-50",
        "last:border-b-0",
        "hover:border-l-amber-500/70",
      )}
    >
      {/* Card Name */}
      <TableCell className="py-4 px-6 align-middle font-light truncate">
        {update.card_name}
      </TableCell>

      {/* Set */}
      <TableCell className="py-4 px-6 align-middle font-light truncate">
        {update.set_name}
      </TableCell>

      {/* Game */}
      <TableCell className="py-4 px-6 align-middle font-light truncate">
        {update.game_name}
      </TableCell>

      {/* Update Type */}
      <TableCell className="py-4 px-6 align-middle font-light capitalize text-amber-600">
        {update.update_type}
      </TableCell>

      {/* Quantity Change */}
      <TableCell
        className={cn(
          "py-4 px-6 align-middle text-right font-light",
          isPositive ? "text-green-600" : "text-red-600",
        )}
      >
        {isPositive ? `+${update.quantity_change}` : update.quantity_change}
      </TableCell>

      {/* Note */}
      <TableCell className="py-4 px-6 align-middle font-light truncate text-muted-foreground">
        {update.note}
      </TableCell>

      {/* Date */}
      <TableCell className="py-4 px-6 align-middle text-right text-sm font-light text-muted-foreground">
        {format(new Date(update.created_at), "MMM dd, yyyy")}
      </TableCell>

      {/* Search Icon */}
      <TableCell className="py-4 px-6 align-middle text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`/inventory/item/${update.core_card_id}`, "_blank");
          }}
          className="h-6 w-6 p-0 hover:bg-muted/30 opacity-60 group-hover:opacity-100 transition-all duration-150"
          title="Look up product"
        >
          <Search className="h-4 w-4 text-muted-foreground/70" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
