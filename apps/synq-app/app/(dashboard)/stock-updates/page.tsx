// TODO: This file needs refactoring
"use client";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  StockAuditLogService,
  StockAuditLogItem,
} from "@synq/supabase/services";
import { StockUpdateRow } from "@/features/stock-updates/components/stock-updates-row";
import { Button, Badge } from "@synq/ui/component";

export default function StockUpdatesPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const auditId = searchParams.get("id");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ["stock-audit-logs"],
    queryFn: () => StockAuditLogService.getUserAuditLogs("client"),
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ["stock-audit-logs"] });
    };
  }, [queryClient]);

  const filteredUpdates = useMemo(() => {
    let list = updates as StockAuditLogItem[];
    if (typeFilter) list = list.filter((u) => u.change_type === typeFilter);
    if (auditId) list = list.filter((u) => u.id === auditId);
    return list;
  }, [updates, typeFilter, auditId]);

  const clearAuditId = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("id");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  };

  return (
    <div className="h-full flex flex-col bg-background p-6 space-y-4">
      {/* Filter buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={typeFilter === null ? "default" : "outline"}
          onClick={() => setTypeFilter(null)}
        >
          All
        </Button>
        <Button
          size="sm"
          variant={typeFilter === "create" ? "default" : "outline"}
          onClick={() => setTypeFilter("create")}
        >
          Create
        </Button>
        <Button
          size="sm"
          variant={typeFilter === "sale" ? "default" : "outline"}
          onClick={() => setTypeFilter("sale")}
        >
          Sale
        </Button>
      </div>

      {/* Active audit filter badge */}
      {auditId && (
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="cursor-pointer flex items-center gap-1"
            onClick={clearAuditId}
          >
            Audit: {auditId.slice(0, 8)}… ✕
          </Badge>
        </div>
      )}

      {/* Content */}
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {!isLoading && filteredUpdates.length === 0 && (
        <p className="text-muted-foreground">No stock updates found.</p>
      )}

      <div className="overflow-y-auto space-y-1">
        {filteredUpdates.map((update) => (
          <StockUpdateRow key={update.id} update={update} />
        ))}
      </div>
    </div>
  );
}
