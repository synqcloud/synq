"use client";

import { format } from "date-fns";
import { StockAuditLogItem } from "@synq/supabase/services";
import { cn } from "@synq/ui/utils";

export function StockUpdateRow({ update }: { update: StockAuditLogItem }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 px-4 py-2 ",
        "border border-l-4 border-l-amber-500 hover:bg-amber-50 transition-colors",
      )}
    >
      <p className="text-xs text-foreground leading-snug">{update.message}</p>

      <span className="text-[11px] text-muted-foreground">
        {format(new Date(update.created_at), "PPpp")}
      </span>
    </div>
  );
}
