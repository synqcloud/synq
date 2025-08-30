import { TransactionType } from "@synq/supabase/services";

export function getTransactionTypeLabel(type: TransactionType) {
  const labels: Record<TransactionType, string> = {
    BUY: "Buy",
    SELL: "Sell",
    STOCK_MOVEMENT: "Stock Movement",
    MARKETPLACE_LISTING: "Marketplace Listing",
  };
  return labels[type];
}

export function getTransactionTypeColor(type: TransactionType) {
  if (type === "BUY") return "bg-emerald-200/60";
  if (type === "SELL") return "bg-red-200/60";
  if (type === "STOCK_MOVEMENT") return "bg-amber-200/60";
  if (type === "MARKETPLACE_LISTING") return "bg-blue-200/60";
  return "bg-slate-200/60";
}
