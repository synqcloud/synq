// Components
import { BaseTable, Column } from "@/shared/table/base-table";
import { OrderRowGroup } from "./orders-row";
// Services
import { UserOrder } from "@synq/supabase/services";

type Order = UserOrder & { total_quantity: number };

const orderColumns: Column<Order>[] = [
  { key: "type", label: "Type", width: 180 },
  { key: "products", label: "Products", width: 120 },
  { key: "source", label: "Source", width: 140 },
  { key: "netAmount", label: "Net Amount", width: 100, align: "right" },
  { key: "date", label: "Date", width: 80, align: "right" },
];

export function OrdersTable({ transactions }: { transactions: Order[] }) {
  return (
    <BaseTable<Order>
      data={transactions}
      columns={orderColumns}
      renderRowAction={(order) => (
        <OrderRowGroup key={order.id} order={order} />
      )}
    />
  );
}
