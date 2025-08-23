import { motion } from "framer-motion";
import { formatCurrency } from "@/shared/utils/format-currency";
import { Transaction } from "./transactions-table";

interface TransactionsSummaryProps {
  transactions: Transaction[];
}

export function TransactionsSummary({
  transactions,
}: TransactionsSummaryProps) {
  // Calculate summary stats
  const totalIncome = transactions
    .filter((t) => t.net_amount > 0)
    .reduce((sum, t) => sum + t.net_amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.net_amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.net_amount), 0);

  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Income
        </div>
        <div className="text-2xl font-light tracking-tight text-emerald-600 ">
          {formatCurrency(totalIncome)}
        </div>
        <div className="text-xs text-muted-foreground">
          {transactions.filter((t) => t.net_amount > 0).length} transactions
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Expenses
        </div>
        <div className="text-2xl font-light tracking-tight text-red-500 ">
          {formatCurrency(totalExpenses)}
        </div>
        <div className="text-xs text-muted-foreground">
          {transactions.filter((t) => t.net_amount < 0).length} transactions
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Net Profit
        </div>
        <div
          className={`text-2xl font-light tracking-tight  ${netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}
        >
          {formatCurrency(netProfit)}
        </div>
        <div className="text-xs text-muted-foreground">This period</div>
      </div>
    </div>
  );
}
