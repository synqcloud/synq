"use client";

import { useRef, useEffect } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/component";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { motion, HTMLMotionProps, MotionProps } from "framer-motion";
import { Stack, HStack, VStack } from "@synq/ui/component";

// Make a custom type that correctly extends HTMLMotionProps
type MotionDivProps = HTMLMotionProps<"div"> &
  MotionProps & {
    className?: string;
  };

// Create a typed motion.div component
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

// Animation variants - more subtle
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Format currency function
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Sample data
const monthlyPLData = [
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
const salesPerCategoryData = [
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

// Top performing SKUs data
const topPerformingSKUsData = [
  {
    sku: "Charizard VMAX",
    sales: 45,
    revenue: 13500,
    margin: 0.35,
    stockLevel: 12,
    daysOfStock: 8,
    trend: "up",
  },
  {
    sku: "Black Lotus",
    sales: 38,
    revenue: 11400,
    margin: 0.32,
    stockLevel: 8,
    daysOfStock: 6,
    trend: "up",
  },
  {
    sku: "Mickey Mouse - Brave Little Tailor",
    sales: 156,
    revenue: 4680,
    margin: 0.45,
    stockLevel: 45,
    daysOfStock: 8,
    trend: "up",
  },
  {
    sku: "Blue-Eyes White Dragon",
    sales: 89,
    revenue: 1780,
    margin: 0.5,
    stockLevel: 23,
    daysOfStock: 7,
    trend: "stable",
  },
  {
    sku: "Captain Hook - Forceful Duelist",
    sales: 67,
    revenue: 3350,
    margin: 0.4,
    stockLevel: 15,
    daysOfStock: 6,
    trend: "up",
  },
];

// Underperforming SKUs data
const underperformingSKUsData = [
  {
    sku: "Pikachu V",
    sales: 2,
    revenue: 8,
    margin: 0.15,
    stockLevel: 15,
    daysOfStock: 225,
    trend: "down",
    issue: "Low margin, high inventory",
  },
  {
    sku: "Lightning Bolt",
    sales: 1,
    revenue: 45,
    margin: 0.2,
    stockLevel: 8,
    daysOfStock: 240,
    trend: "down",
    issue: "Slow moving",
  },
  {
    sku: "Maleficent - Dragon Form",
    sales: 3,
    revenue: 75,
    margin: 0.25,
    stockLevel: 12,
    daysOfStock: 120,
    trend: "down",
    issue: "Overstocked",
  },
  {
    sku: "Dark Magician",
    sales: 5,
    revenue: 125,
    margin: 0.3,
    stockLevel: 18,
    daysOfStock: 108,
    trend: "down",
    issue: "High cost, low demand",
  },
  {
    sku: "Aurora - Dreaming Guardian",
    sales: 4,
    revenue: 60,
    margin: 0.18,
    stockLevel: 25,
    daysOfStock: 187,
    trend: "down",
    issue: "Low margin product",
  },
];

// Inventory value data
const inventoryValueData = [
  {
    category: "TCG Products",
    value: 125000,
    percentage: 45,
    aging: "< 30 days",
    skuCount: 1200,
    trend: "up",
  },
  {
    category: "Accessories",
    value: 85000,
    percentage: 30.5,
    aging: "< 60 days",
    skuCount: 1800,
    trend: "up",
  },
  {
    category: "Board Games",
    value: 35000,
    percentage: 12.5,
    aging: "< 90 days",
    skuCount: 800,
    trend: "down",
  },
  {
    category: "Supplies",
    value: 25000,
    percentage: 9,
    aging: "< 30 days",
    skuCount: 1200,
    trend: "down",
  },
  {
    category: "Other",
    value: 10000,
    percentage: 3,
    aging: "< 45 days",
    skuCount: 1000,
    trend: "stable",
  },
];

// Stock alerts data
const stockAlertData = [
  {
    sku: "Charizard VMAX",
    status: "critical",
    daysOutOfStock: 2,
    impact: "High",
    recommendedOrder: 20,
    lastRestock: "2024-01-15",
    category: "Pokemon",
  },
  {
    sku: "Black Lotus",
    status: "warning",
    daysOutOfStock: 0,
    impact: "Medium",
    recommendedOrder: 50,
    lastRestock: "2024-01-20",
    category: "MTG",
  },
  {
    sku: "Mickey Mouse - Brave Little Tailor",
    status: "critical",
    daysOutOfStock: 1,
    impact: "High",
    recommendedOrder: 15,
    lastRestock: "2024-01-18",
    category: "Lorcana",
  },
  {
    sku: "Blue-Eyes White Dragon",
    status: "healthy",
    daysOutOfStock: 0,
    impact: "Low",
    recommendedOrder: 0,
    lastRestock: "2024-01-25",
    category: "Yu-Gi-Oh",
  },
];

// Inventory issues data
const inventoryIssuesData = [
  {
    issue: "Slow Moving Inventory",
    value: 45000,
    skuCount: 850,
    impact: "High",
    category: "Supplies & Board Games",
  },
  {
    issue: "Low Margin Products",
    value: 28000,
    skuCount: 1200,
    impact: "Medium",
    category: "Supplies",
  },
  {
    issue: "Overstocked Items",
    value: 32000,
    skuCount: 450,
    impact: "Medium",
    category: "Accessories",
  },
  {
    issue: "Expired Products",
    value: 8000,
    skuCount: 120,
    impact: "High",
    category: "TCG Products",
  },
];

const chartConfig = {
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
} satisfies ChartConfig;

export default function HomePage() {
  const sectionRef = useRef(null);

  useEffect(() => {
    document.title = "Portfolio Overview";
  }, []);

  return (
    <div className="bg-background h-full overflow-y-auto">
      {/* Main Content Area */}
      <div className="p-4 h-full">
        <VStack gap={6} className="h-full">
          <MotionDiv
            ref={sectionRef}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex-1 min-h-0"
          >
            {/* Top Chart - Sales and Revenue Performance */}
            <MotionDiv
              variants={fadeInUp}
              className="h-[45vh] md:h-[50vh] lg:h-[55vh] flex-shrink-0"
            >
              <div className="border border-border rounded-lg p-6 shadow-sm h-full">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-2">
                  <div>
                    <h2 className="text-lg lg:text-xl font-light tracking-[-0.01em] text-foreground">
                      Sales and Revenue Performance
                    </h2>
                    <p className="text-xs lg:text-sm font-light tracking-[-0.01em] text-muted-foreground">
                      Monthly sales and revenue trends for the last 5 months
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="5-months">
                      <SelectTrigger className="w-[120px] lg:w-[140px] h-8 text-xs font-light tracking-[-0.01em]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3-months">Last 3 months</SelectItem>
                        <SelectItem value="5-months">Last 5 months</SelectItem>
                        <SelectItem value="12-months">
                          Last 12 months
                        </SelectItem>
                        <SelectItem value="this-year">This year</SelectItem>
                      </SelectContent>
                    </Select>
                    <button className="text-xs font-light tracking-[-0.01em] text-muted-foreground hover:text-foreground">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <ChartContainer
                  config={chartConfig}
                  className="w-full h-[calc(100%-120px)]"
                >
                  <BarChart
                    data={monthlyPLData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 12,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} className="opacity-20" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 12, fontFamily: "Inter" }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 12, fontFamily: "Inter" }}
                      className="text-muted-foreground"
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--chart-1))"
                      radius={[2, 2, 0, 0]}
                      name="Revenue"
                      barSize={40}
                    />
                    <Bar
                      dataKey="profit"
                      fill="hsl(var(--chart-2))"
                      radius={[2, 2, 0, 0]}
                      name="Profit"
                      barSize={40}
                    />
                  </BarChart>
                </ChartContainer>
                <div className="flex items-center gap-4 lg:gap-6 mt-4 lg:mt-6">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block w-2 h-2 lg:w-3 lg:h-3 rounded-full"
                      style={{
                        background: "hsl(var(--chart-1))",
                      }}
                    />
                    <span className="text-xs lg:text-sm font-light tracking-[-0.01em] text-muted-foreground">
                      Revenue
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block w-2 h-2 lg:w-3 lg:h-3 rounded-full"
                      style={{
                        background: "hsl(var(--chart-2))",
                      }}
                    />
                    <span className="text-xs lg:text-sm font-light tracking-[-0.01em] text-muted-foreground">
                      Profit
                    </span>
                  </span>
                </div>
              </div>
            </MotionDiv>

            {/* Three Cards Row */}
            <MotionDiv variants={fadeInUp} className="flex-1 min-h-0 mt-6">
              <div className="space-y-4 h-full">
                {/* First Row - 1 Card */}
                <div className="h-[calc(50%-8px)]">
                  {/* Top Performers - Velocity of Cards Sold */}
                  <div className="border border-border rounded-lg shadow-sm h-full flex flex-col min-h-0">
                    <div className="border-b bg-muted/30 p-4 flex-shrink-0">
                      <h2 className="text-base font-light tracking-[-0.01em] text-foreground">
                        Top Performers
                      </h2>
                      <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground mt-1">
                        Fastest selling cards
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="py-3">
                        {topPerformingSKUsData
                          .slice(0, 6)
                          .map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border-b border-border hover:bg-accent/50 transition-colors last:border-b-0"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground text-xs font-light tracking-[-0.01em] truncate">
                                  {item.sku}
                                </div>
                                <div className="text-xs font-light tracking-[-0.01em] text-muted-foreground">
                                  SKU:{" "}
                                  {item.sku.replace(/\s+/g, "-").toUpperCase()}
                                </div>
                                <div className="text-xs font-light tracking-[-0.01em] text-muted-foreground">
                                  {item.sales} sold •{" "}
                                  {(item.sales / 30).toFixed(1)}/day
                                </div>
                              </div>
                              <div className="text-right ml-2">
                                <div className="font-medium text-foreground text-xs font-light tracking-[-0.01em]">
                                  {formatCurrency(item.revenue)}
                                </div>
                                <div className="text-xs text-green-600 font-light tracking-[-0.01em]">
                                  {(item.margin * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Row - 2 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 h-[calc(50%-8px)]">
                  {/* Most Sold Games/Sets */}
                  <div className="border border-border rounded-lg shadow-sm min-w-0 flex flex-col min-h-0">
                    <div className="border-b bg-muted/30 p-4 flex-shrink-0">
                      <h2 className="text-base font-light tracking-[-0.01em] text-foreground">
                        Most Sold
                      </h2>
                      <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground mt-1">
                        Games performance
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="py-3">
                        {[
                          {
                            name: "Charizard VMAX",
                            sales: 156,
                            revenue: 23400,
                            trend: "up",
                          },
                          {
                            name: "Black Lotus",
                            sales: 89,
                            revenue: 17800,
                            trend: "up",
                          },
                          {
                            name: "Mickey Mouse - Brave Little Tailor",
                            sales: 134,
                            revenue: 20100,
                            trend: "stable",
                          },
                          {
                            name: "Blue-Eyes White Dragon",
                            sales: 67,
                            revenue: 10050,
                            trend: "down",
                          },
                          {
                            name: "Pikachu V",
                            sales: 234,
                            revenue: 35100,
                            trend: "up",
                          },
                          {
                            name: "Lightning Bolt",
                            sales: 123,
                            revenue: 18450,
                            trend: "stable",
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border-b border-border hover:bg-accent/50 transition-colors last:border-b-0"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground text-xs font-light tracking-[-0.01em] truncate">
                                {item.name}
                              </div>
                              <div className="text-xs font-light tracking-[-0.01em] text-muted-foreground">
                                {item.sales} sold
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="font-medium text-foreground text-xs font-light tracking-[-0.01em]">
                                {formatCurrency(item.revenue)}
                              </div>
                              <div
                                className={`text-xs font-light tracking-[-0.01em] ${
                                  item.trend === "up"
                                    ? "text-green-600"
                                    : item.trend === "down"
                                      ? "text-red-600"
                                      : "text-yellow-600"
                                }`}
                              >
                                {item.trend === "up"
                                  ? "↗"
                                  : item.trend === "down"
                                    ? "↘"
                                    : "→"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Alerts */}
                  <div className="border border-border rounded-lg shadow-sm min-w-0 flex flex-col min-h-0">
                    <div className="border-b bg-muted/30 p-4 flex-shrink-0">
                      <h2 className="text-base font-light tracking-[-0.01em] text-foreground">
                        Low Stock Alerts
                      </h2>
                      <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground mt-1">
                        Items requiring restock
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="py-3">
                        {stockAlertData.slice(0, 6).map((item, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 border-b border-border hover:bg-accent/50 transition-colors last:border-b-0 ${
                              item.status === "critical"
                                ? "bg-red-50/20"
                                : item.status === "warning"
                                  ? "bg-yellow-50/20"
                                  : ""
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground text-xs font-light tracking-[-0.01em] truncate">
                                {item.sku}
                              </div>
                              <div className="text-xs font-light tracking-[-0.01em] text-muted-foreground">
                                {item.category}
                              </div>
                              <div
                                className={`text-xs font-light tracking-[-0.01em] ${
                                  item.status === "critical"
                                    ? "text-red-600"
                                    : item.status === "warning"
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                }`}
                              >
                                {item.status === "critical"
                                  ? "Critical"
                                  : item.status === "warning"
                                    ? "Warning"
                                    : "Healthy"}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="font-medium text-foreground text-xs font-light tracking-[-0.01em]">
                                {item.recommendedOrder} units
                              </div>
                              <div className="text-xs font-light tracking-[-0.01em] text-muted-foreground">
                                {item.daysOutOfStock > 0
                                  ? `${item.daysOutOfStock}d out`
                                  : "In stock"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        </VStack>
      </div>
    </div>
  );
}
