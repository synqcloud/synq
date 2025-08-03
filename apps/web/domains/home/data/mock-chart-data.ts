// Monthly P&L Data
export const monthlyPLData = [
  {
    date: "Jan",
    revenue: 85000,
    cost: 51000,
    profit: 34000,
    margin: 0.4,
  },
  {
    date: "Feb",
    revenue: 92000,
    cost: 55200,
    profit: 36800,
    margin: 0.4,
  },
  {
    date: "Mar",
    revenue: 88000,
    cost: 52800,
    profit: 35200,
    margin: 0.4,
  },
  {
    date: "Apr",
    revenue: 95000,
    cost: 57000,
    profit: 38000,
    margin: 0.4,
  },
  {
    date: "May",
    revenue: 102000,
    cost: 61200,
    profit: 40800,
    margin: 0.4,
  },
];

// Sales per category data
export const salesPerCategoryData = [
  {
    month: "Jan",
    "TCG Products": 52000,
    Accessories: 18000,
    "Board Games": 8000,
    Supplies: 7000,
  },
  {
    month: "Feb",
    "TCG Products": 58000,
    Accessories: 20000,
    "Board Games": 9000,
    Supplies: 5000,
  },
  {
    month: "Mar",
    "TCG Products": 54000,
    Accessories: 19000,
    "Board Games": 10000,
    Supplies: 5000,
  },
  {
    month: "Apr",
    "TCG Products": 62000,
    Accessories: 21000,
    "Board Games": 8000,
    Supplies: 4000,
  },
  {
    month: "May",
    "TCG Products": 68000,
    Accessories: 22000,
    "Board Games": 7000,
    Supplies: 3000,
  },
];

// Chart configuration
export const chartConfig = {
  value: {
    label: "Portfolio Value",
    color: "hsl(var(--chart-1))",
  },
  net: {
    label: "Net P&L",
    color: "hsl(var(--chart-2))",
  },
  cards: {
    label: "Cards",
    color: "hsl(var(--chart-3))",
  },
  pokemon: {
    label: "Pokemon",
    color: "hsl(var(--chart-1))",
  },
  mtg: {
    label: "MTG",
    color: "hsl(var(--chart-2))",
  },
  disney: {
    label: "Disney",
    color: "hsl(var(--chart-3))",
  },
  yugioh: {
    label: "Yu-Gi-Oh",
    color: "hsl(var(--chart-4))",
  },
} as const;
