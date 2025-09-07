// Components
import { BaseTable, Column } from "@/shared/table/base-table";
import { TransactionTableRow } from "./transaction-table-row";
// Services
import { UserTransaction } from "@synq/supabase/services";

type Order = UserTransaction & { total_quantity: number };

const orderColumns: Column<Order>[] = [
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "source", label: "Source / Channel" },
  { key: "items", label: "Number of Items" },
  { key: "fees", label: "Fees" },
  // { key: "shipping", label: "Shipping Costs" },
  { key: "netAmount", label: "Net Amount" },
  // { key: "subtotal", label: "Subtotal" },
  { key: "date", label: "Date" },
  // { key: "actions", label: "", align: "right" },
];

export function TransactionTable({ transactions }: { transactions: Order[] }) {
  return (
    <BaseTable<Order>
      data={transactions}
      columns={orderColumns}
      renderRowAction={(order) => (
        <TransactionTableRow key={order.id} order={order} />
      )}
    />
  );
}
