import { TransactionType } from "@synq/supabase/services";

export function getTransactionTypeLabel(type: TransactionType) {
  const labels: Record<TransactionType, string> = {
    ORDER: "Order",
    SALE: "Sale",
    LISTING: "Marketplace Listing",
  };
  return labels[type];
}

export function getTransactionTypeColor(type: TransactionType) {
  if (type === "ORDER") return "bg-red-200/60";
  if (type === "SALE") return "bg-emerald-200/60";
  if (type === "LISTING") return "bg-blue-200/60";
  return "bg-slate-200/60";
}
