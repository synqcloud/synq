"use client";

// Components
import { TransactionRowGroup } from "./transaction-row";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/component";

// Services
import { UserTransaction } from "@synq/supabase/services";

export function TransactionsTable({
  transactions,
}: {
  transactions: (UserTransaction & { total_quantity: number })[];
}) {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto overscroll-x-contain">
        <Table className="table-fixed" style={{ minWidth: "620px" }}>
          <colgroup>
            <col style={{ width: "180px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "80px" }} />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-light px-4">Type</TableHead>
              <TableHead className="text-xs font-light px-4">
                Products
              </TableHead>
              <TableHead className="text-xs font-light px-4">Source</TableHead>
              <TableHead className="text-xs font-light text-right px-4">
                Net Amount
              </TableHead>
              <TableHead className="text-xs font-light text-right px-4">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TransactionRowGroup key={tx.id} transaction={tx} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
