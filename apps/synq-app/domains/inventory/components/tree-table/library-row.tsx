// Core
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Components
import SetRow from "./set-row";
import { ChevronDown, ChevronRight } from "lucide-react";

// Services
import { CoreLibrary, InventoryService } from "@synq/supabase/services";

export function LibraryRow({
  library,
}: {
  library: Pick<CoreLibrary, "id" | "name"> & { stock: number };
}) {
  const [expanded, setExpanded] = useState(false);

  const { data: sets } = useQuery({
    queryKey: ["sets", library.id],
    queryFn: () => InventoryService.fetchSetsByLibrary("client", library.id),
    enabled: expanded,
  });

  return (
    <div key={library.id}>
      {/* Group Header */}
      <div
        className={`flex items-center px-4 py-2 cursor-pointer hover:bg-accent bg-muted font-light tracking-[-0.01em]`}
        style={{ paddingLeft: `${16 + 0 * 24}px` }}
        onClick={() => setExpanded(!expanded)}
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
      {/* Expanded Content */}
      {expanded && sets?.map((set) => <SetRow key={set.id} set={set} />)}
    </div>
  );
}
