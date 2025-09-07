import { BaseTable, Column } from "@/shared/table/base-table";
import { StockUpdateRow } from "./stock-update-row";
import { StockUpdateWithCard } from "@synq/supabase/services";

// Columns must match the TableCells in StockRow
const stockColumns: Column<StockUpdateWithCard>[] = [
  { key: "card_name", label: "Card", width: 180 },
  { key: "set_name", label: "Set", width: 140 },
  { key: "game_name", label: "Game", width: 120 },
  { key: "update_type", label: "Type", width: 100 },
  { key: "quantity_change", label: "Qty", width: 80, align: "right" },
  { key: "note", label: "Note", width: 200 },
  { key: "created_at", label: "Date", width: 100, align: "right" },
  { key: "actions", label: "Actions", width: 100, align: "right" },
];

export function StockTable({ updates }: { updates: StockUpdateWithCard[] }) {
  return (
    <BaseTable<StockUpdateWithCard>
      data={updates}
      columns={stockColumns}
      renderRowAction={(update) => (
        <StockUpdateRow key={update.id} update={update} />
      )}
    />
  );
}
