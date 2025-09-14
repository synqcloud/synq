// Core
import { useState, useCallback, useMemo } from "react";
// Components
import { ChevronDown, ChevronRight } from "lucide-react";
// Services
import TransactionStockTable from "./transaction-stock-table";

export default function TransactionCardRow({
  card,
  onAddToTransactionAction,
}: {
  card: {
    id: string;
    name: string;
    core_set_name: string | null;
    core_library_name: string | null;
    stock: number;
  };
  onAddToTransactionAction?: (stockId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Memoize computed values
  const outOfStock = useMemo(() => card.stock === 0, [card.stock]);

  // Memoize display name calculation
  const displayName = useMemo(() => {
    const hasSet = card.core_set_name;
    const hasLibrary = card.core_library_name;

    if (!hasSet && !hasLibrary) return card.name;

    const setName = hasSet ? card.core_set_name : "";
    const libraryName = hasLibrary ? card.core_library_name : "";
    const separator = hasSet && hasLibrary ? " - " : "";

    return `${card.name} (${setName}${separator}${libraryName})`;
  }, [card.name, card.core_set_name, card.core_library_name]);

  // Memoize className calculations
  const headerClassName = useMemo(() => {
    const baseClasses =
      "flex items-center px-4 py-2 pl-16 cursor-pointer hover:bg-accent border-l-2";
    const conditionalClasses = outOfStock
      ? "bg-muted/30 opacity-60 border-muted"
      : "bg-accent/50 border-primary";

    return `${baseClasses} ${conditionalClasses}`;
  }, [outOfStock]);

  const textClassName = useMemo(() => {
    const baseClasses = "flex-1 font-light tracking-[-0.01em]";
    const conditionalClasses = outOfStock ? "text-muted-foreground" : "";

    return `${baseClasses} ${conditionalClasses}`;
  }, [outOfStock]);

  // Memoize toggle function
  const handleToggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div key={card.id}>
      {/* Card Header */}
      <div className={headerClassName} onClick={handleToggleExpanded}>
        {expanded ? (
          <ChevronDown className="w-4 h-4 mr-2" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2" />
        )}
        <span className={textClassName}>
          {displayName} ({card.stock})
          {outOfStock && (
            <span className="text-xs text-red-500 ml-2">(Out of Stock)</span>
          )}
        </span>
      </div>

      {/* Expanded Stock Table */}
      {expanded && (
        <TransactionStockTable
          cardId={card.id}
          onAddToTransactionAction={onAddToTransactionAction}
        />
      )}
    </div>
  );
}
