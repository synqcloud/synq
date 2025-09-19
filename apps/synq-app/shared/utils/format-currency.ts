export const formatCurrency = (amount: number, currency: "usd" | "eur") => {
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  };

  if (currency === "usd") return "$" + amount.toLocaleString("en-US", options);
  return "€" + amount.toLocaleString("de-DE", options);
};
