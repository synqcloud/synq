/**
 * Analytics Dashboard - Refactored with new performance metrics
 */
"use client";

import { useRef, useEffect, useState } from "react";
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
  VStack,
  HStack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@synq/ui/component";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion, HTMLMotionProps, MotionProps } from "framer-motion";
import {
  DashboardService,
  SetPerformanceData,
  CardPerformanceData,
  MarketplacePerformanceData,
  SummaryStats,
} from "@synq/supabase/services";
import { useCurrency } from "@/shared/contexts/currency-context";
import { formatCurrency } from "@/shared/utils/format-currency";
import {
  TrendingUp,
  Package,
  Store,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

// Motion div
type MotionDivProps = HTMLMotionProps<"div"> &
  MotionProps & { className?: string };
const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

// Chart configs
const revenueChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  profit: { label: "Profit", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const marketplaceColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
  <MotionDiv
    variants={fadeInUp}
    className="border border-border rounded-lg p-4 shadow-sm bg-background"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground mb-1">
          {title}
        </p>
        <p className="text-2xl font-semibold tracking-[-0.02em] text-foreground mb-1">
          {value}
        </p>
        {subtitle && (
          <div className="flex items-center gap-1 text-xs">
            {trend && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
            <span className="text-muted-foreground font-light tracking-[-0.01em]">
              {subtitle}
            </span>
          </div>
        )}
      </div>
      <div className="bg-primary/10 p-2 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
  </MotionDiv>
);

export default function AnalyticsPage() {
  const sectionRef = useRef(null);
  const { currency } = useCurrency();

  // State
  const [periodValue, setPeriodValue] = useState<string>("6-months");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sets");

  // Analytics data
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [setPerformance, setSetPerformance] = useState<SetPerformanceData[]>(
    [],
  );
  const [cardPerformance, setCardPerformance] = useState<CardPerformanceData[]>(
    [],
  );
  const [marketplacePerformance, setMarketplacePerformance] = useState<
    MarketplacePerformanceData[]
  >([]);

  // Date range calculation
  const getDateRange = (
    period: string,
  ): { startDate: string; endDate: string } => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "1-month":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "3-months":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "6-months":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "12-months":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "this-year":
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }

    return {
      startDate: startDate?.toISOString().split("T")[0] ?? "",
      endDate: endDate?.toISOString().split("T")[0] ?? "",
    };
  };

  const fetchAnalyticsData = async (period: string) => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(period);

      const data = await DashboardService.fetchAnalyticsDashboard(
        "client",
        startDate,
        endDate,
      );

      setSummaryStats(data.summary_stats);
      setSetPerformance(data.sets_performance || []);
      setCardPerformance(data.top_cards || []);
      setMarketplacePerformance(data.marketplace_performance || []);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(periodValue);
  }, [periodValue]);

  const handlePeriodChange = (value: string) => {
    setPeriodValue(value);
  };

  const getPeriodLabel = (period: string): string => {
    switch (period) {
      case "1-month":
        return "Last Month";
      case "3-months":
        return "Last 3 Months";
      case "6-months":
        return "Last 6 Months";
      case "12-months":
        return "Last 12 Months";
      case "this-year":
        return "This Year";
      default:
        return "Last 6 Months";
    }
  };

  if (loading) {
    return (
      <div className="bg-background h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  const profitMargin = summaryStats?.total_revenue
    ? ((summaryStats.total_profit / summaryStats.total_revenue) * 100).toFixed(
        1,
      )
    : "0";

  return (
    <div className="bg-background h-full overflow-y-auto">
      <div className="p-4 h-full">
        <VStack gap={6}>
          <MotionDiv
            ref={sectionRef}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Header */}
            <MotionDiv
              variants={fadeInUp}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-6"
            >
              <div>
                <h1 className="text-2xl font-light tracking-[-0.02em] text-foreground">
                  Performance Analytics
                </h1>
                <p className="text-sm font-light tracking-[-0.01em] text-muted-foreground mt-1">
                  Track your inventory performance and sales metrics
                </p>
              </div>
              <Select value={periodValue} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-[160px] h-9 text-sm font-light tracking-[-0.01em]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-month">Last Month</SelectItem>
                  <SelectItem value="3-months">Last 3 Months</SelectItem>
                  <SelectItem value="6-months">Last 6 Months</SelectItem>
                  <SelectItem value="12-months">Last 12 Months</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </MotionDiv>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(
                  summaryStats?.total_revenue || 0,
                  currency,
                )}
                subtitle={`${summaryStats?.total_transactions || 0} transactions`}
                icon={TrendingUp}
                trend={true}
              />
              <StatCard
                title="Total Profit"
                value={formatCurrency(
                  summaryStats?.total_profit || 0,
                  currency,
                )}
                subtitle={`${profitMargin}% margin`}
                icon={Package}
                trend={true}
              />
              <StatCard
                title="Units Sold"
                value={(summaryStats?.total_units_sold || 0).toLocaleString()}
                subtitle={`Avg ${formatCurrency(summaryStats?.avg_transaction_value || 0, currency)}/transaction`}
                icon={Store}
              />
              <StatCard
                title="Period"
                value={getPeriodLabel(periodValue)}
                subtitle={`${summaryStats?.date_range?.start_date || ""} to ${summaryStats?.date_range?.end_date || ""}`}
                icon={CreditCard}
              />
            </div>

            {/* Tabbed Content */}
            <MotionDiv variants={fadeInUp}>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sets">Set Performance</TabsTrigger>
                  <TabsTrigger value="cards">Top Cards</TabsTrigger>
                  <TabsTrigger value="marketplaces">Marketplaces</TabsTrigger>
                </TabsList>

                {/* Set Performance Tab */}
                <TabsContent value="sets" className="mt-6">
                  <div className="border border-border rounded-lg p-6 shadow-sm">
                    <div className="mb-6">
                      <h2 className="text-lg font-light tracking-[-0.01em] text-foreground">
                        Set Performance
                      </h2>
                      <p className="text-sm font-light tracking-[-0.01em] text-muted-foreground mt-1">
                        Revenue and profit by Magic: The Gathering set
                      </p>
                    </div>
                    <ChartContainer
                      config={revenueChartConfig}
                      className="w-full h-[400px]"
                    >
                      <BarChart
                        data={setPerformance.slice(0, 10)}
                        margin={{ left: 12, right: 12, top: 12, bottom: 60 }}
                      >
                        <CartesianGrid
                          vertical={false}
                          className="opacity-20"
                        />
                        <XAxis
                          dataKey="set_code"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 11, fontFamily: "Inter" }}
                          className="text-muted-foreground"
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) =>
                            formatCurrency(value, currency)
                          }
                          tick={{ fontSize: 11, fontFamily: "Inter" }}
                          className="text-muted-foreground"
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Bar
                          dataKey="total_revenue"
                          fill="hsl(var(--chart-1))"
                          radius={[2, 2, 0, 0]}
                          name="Revenue"
                          barSize={40}
                        />
                        <Bar
                          dataKey="total_profit"
                          fill="hsl(var(--chart-2))"
                          radius={[2, 2, 0, 0]}
                          name="Profit"
                          barSize={40}
                        />
                      </BarChart>
                    </ChartContainer>

                    {/* Set Performance Table */}
                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border">
                          <tr className="text-left">
                            <th className="pb-2 font-light tracking-[-0.01em] text-muted-foreground">
                              Set
                            </th>
                            <th className="pb-2 font-light tracking-[-0.01em] text-muted-foreground text-right">
                              Revenue
                            </th>
                            <th className="pb-2 font-light tracking-[-0.01em] text-muted-foreground text-right">
                              Profit
                            </th>
                            <th className="pb-2 font-light tracking-[-0.01em] text-muted-foreground text-right">
                              Margin
                            </th>
                            <th className="pb-2 font-light tracking-[-0.01em] text-muted-foreground text-right">
                              Units
                            </th>
                            <th className="pb-2 font-light tracking-[-0.01em] text-muted-foreground text-right">
                              Turn Rate
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {setPerformance.slice(0, 10).map((set, index) => (
                            <tr
                              key={index}
                              className="border-b border-border hover:bg-accent/50 transition-colors"
                            >
                              <td className="py-3 font-light tracking-[-0.01em]">
                                <div className="font-medium">
                                  {set.set_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {set.set_code}
                                </div>
                              </td>
                              <td className="py-3 text-right font-light tracking-[-0.01em]">
                                {formatCurrency(set.total_revenue, currency)}
                              </td>
                              <td className="py-3 text-right font-light tracking-[-0.01em]">
                                {formatCurrency(set.total_profit, currency)}
                              </td>
                              <td className="py-3 text-right font-semibold tracking-[-0.01em]">
                                {set.profit_margin_pct.toFixed(1)}%
                              </td>
                              <td className="py-3 text-right font-light tracking-[-0.01em]">
                                {set.units_sold}
                              </td>
                              <td className="py-3 text-right font-light tracking-[-0.01em]">
                                {set.inventory_turn_rate.toFixed(2)}x
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                {/* Top Cards Tab */}
                <TabsContent value="cards" className="mt-6">
                  <div className="border border-border rounded-lg shadow-sm">
                    <div className="border-b bg-muted/30 p-4">
                      <h2 className="text-base font-light tracking-[-0.01em] text-foreground">
                        Top Performing Cards
                      </h2>
                      <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground mt-1">
                        Best selling cards by revenue and velocity
                      </p>
                    </div>
                    <div className="overflow-y-auto max-h-[600px]">
                      {cardPerformance.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                          No card performance data available
                        </div>
                      ) : (
                        cardPerformance.map((card, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border-b border-border hover:bg-accent/50 transition-colors last:border-b-0"
                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <div className="text-sm font-medium tracking-[-0.01em] text-foreground truncate">
                                {card.card_name}
                              </div>
                              <div className="text-xs font-light tracking-[-0.01em] text-muted-foreground mt-0.5">
                                {card.set_name} • {card.rarity} •{" "}
                                {card.condition}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs font-light tracking-[-0.01em] text-muted-foreground">
                                <span>
                                  Revenue:{" "}
                                  {formatCurrency(card.total_revenue, currency)}
                                </span>
                                <span>•</span>
                                <span>
                                  Profit:{" "}
                                  {formatCurrency(card.total_profit, currency)}
                                </span>
                                <span>•</span>
                                <span className="font-semibold text-foreground">
                                  {card.profit_margin_pct.toFixed(1)}% margin
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                                {card.units_sold} sold
                              </div>
                              <div className="text-xs text-muted-foreground font-light tracking-[-0.01em] mt-0.5">
                                {card.velocity_per_day.toFixed(2)}/day
                              </div>
                              <div className="text-xs text-emerald-600 font-semibold tracking-[-0.01em] mt-1">
                                {card.roi_pct.toFixed(1)}% ROI
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Marketplaces Tab */}
                <TabsContent value="marketplaces" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Marketplace Revenue Pie Chart */}
                    <div className="border border-border rounded-lg p-6 shadow-sm">
                      <h3 className="text-base font-light tracking-[-0.01em] text-foreground mb-4">
                        Revenue by Marketplace
                      </h3>
                      <ChartContainer
                        config={revenueChartConfig}
                        className="w-full h-[300px]"
                      >
                        <PieChart>
                          <Pie
                            data={marketplacePerformance}
                            dataKey="total_revenue"
                            nameKey="marketplace"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) =>
                              `${entry.marketplace}: ${formatCurrency(entry.total_revenue, currency)}`
                            }
                            labelLine={false}
                          >
                            {marketplacePerformance.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  marketplaceColors[
                                    index % marketplaceColors.length
                                  ]
                                }
                              />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </div>

                    {/* Marketplace Stats */}
                    <div className="border border-border rounded-lg shadow-sm">
                      <div className="border-b bg-muted/30 p-4">
                        <h3 className="text-base font-light tracking-[-0.01em] text-foreground">
                          Marketplace Performance
                        </h3>
                        <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground mt-1">
                          Detailed breakdown by platform
                        </p>
                      </div>
                      <div className="overflow-y-auto max-h-[400px]">
                        {marketplacePerformance.map((marketplace, index) => (
                          <div
                            key={index}
                            className="p-4 border-b border-border hover:bg-accent/50 transition-colors last:border-b-0"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium tracking-[-0.01em] text-foreground">
                                {marketplace.marketplace}
                              </div>
                              <div className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                                {formatCurrency(
                                  marketplace.total_revenue,
                                  currency,
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-light tracking-[-0.01em]">
                              <div>
                                <span className="text-muted-foreground">
                                  Profit:
                                </span>{" "}
                                <span className="text-foreground font-medium">
                                  {formatCurrency(
                                    marketplace.total_profit,
                                    currency,
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Margin:
                                </span>{" "}
                                <span className="text-foreground font-semibold">
                                  {marketplace.profit_margin_pct.toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Fees:
                                </span>{" "}
                                <span className="text-foreground">
                                  {formatCurrency(
                                    marketplace.total_fees,
                                    currency,
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Fee %:
                                </span>{" "}
                                <span className="text-foreground font-semibold">
                                  {marketplace.fee_percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Transactions:
                                </span>{" "}
                                <span className="text-foreground">
                                  {marketplace.transaction_count}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Units:
                                </span>{" "}
                                <span className="text-foreground">
                                  {marketplace.units_sold}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </MotionDiv>
          </MotionDiv>
        </VStack>
      </div>
    </div>
  );
}
