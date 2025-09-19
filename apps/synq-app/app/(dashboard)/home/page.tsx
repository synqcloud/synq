/**
 * TODO: This file needs to be refactored.
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
} from "@synq/ui/component";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { motion, HTMLMotionProps, MotionProps } from "framer-motion";
import { DashboardService } from "@synq/supabase/services";
import { useCurrency } from "@/shared/contexts/currency-context";
import { formatCurrency } from "@/shared/utils/format-currency";

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

// Chart config
const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  profit: { label: "Profit", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

// Mapped data types for component state
type MappedMonthlyData = {
  date: string;
  revenue: number;
  profit: number;
  margin: number;
};

type MappedTopStockData = {
  sku: string;
  sales: number;
  revenue: number;
  margin: number;
  daysOfStock: number;
};

export default function HomePage() {
  const sectionRef = useRef(null);
  const { currency } = useCurrency();

  const [monthlyData, setMonthlyData] = useState<MappedMonthlyData[]>([]);
  const [topStock, setTopStock] = useState<MappedTopStockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodValue, setPeriodValue] = useState<string>("5-months");

  const fetchDashboard = async (months: number) => {
    setLoading(true);
    try {
      const { monthly, top_stock } = await DashboardService.fetchUserDashboard(
        "client",
        months,
      );

      const mappedMonthly: MappedMonthlyData[] = (monthly || []).map(
        (m: any) => ({
          date: m.month || "",
          revenue: m.revenue || 0,
          profit: m.profit || 0,
          margin: m.revenue ? m.profit / m.revenue : 0,
        }),
      );

      const mappedTopStock: MappedTopStockData[] = (top_stock || []).map(
        (t: any) => ({
          sku: t.card_name || "",
          sales: t.sold_count || 0,
          revenue: t.revenue || 0,
          margin: t.margin_pct ? t.margin_pct / 100 : 0,
          daysOfStock: t.per_day || 0,
        }),
      );

      setMonthlyData(mappedMonthly);
      setTopStock(mappedTopStock);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthsFromPeriod = (period: string): number => {
    if (period === "3-months") return 3;
    else if (period === "5-months") return 5;
    else if (period === "12-months") return 12;
    else if (period === "this-year") return new Date().getMonth() + 1;
    return 5;
  };

  const getPeriodLabel = (period: string): number => {
    if (period === "this-year") return new Date().getMonth() + 1;
    return getMonthsFromPeriod(period);
  };

  useEffect(() => {
    fetchDashboard(getMonthsFromPeriod(periodValue));
  }, [periodValue]);

  const handlePeriodChange = (value: string) => {
    setPeriodValue(value);
  };

  if (loading) {
    return (
      <div className="bg-background h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-background h-full overflow-y-auto">
      <div className="p-4 h-full">
        <VStack gap={6} className="h-full">
          <MotionDiv
            ref={sectionRef}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex-1 min-h-0"
          >
            {/* Top Chart */}
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
                      Monthly sales and revenue trends for the last{" "}
                      {getPeriodLabel(periodValue)} months
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={periodValue}
                      onValueChange={handlePeriodChange}
                    >
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
                  </div>
                </div>
                <ChartContainer
                  config={chartConfig}
                  className="w-full h-[calc(100%-120px)]"
                >
                  <BarChart
                    data={monthlyData}
                    margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
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
                      tickFormatter={(value) => formatCurrency(value, currency)}
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
              </div>
            </MotionDiv>

            {/* Top Performers */}
            <MotionDiv variants={fadeInUp} className="flex-1 min-h-0 mt-6">
              <div className="space-y-4 h-full">
                <div className="border border-border rounded-lg shadow-sm h-full flex flex-col min-h-0">
                  <div className="border-b bg-muted/30 p-4 flex-shrink-0">
                    <h2 className="text-base font-light tracking-[-0.01em] text-foreground">
                      Top Performers
                    </h2>
                    <p className="text-xs font-light tracking-[-0.01em] text-muted-foreground mt-1">
                      Fastest selling stock (all-time)
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="py-3">
                      {topStock.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                          No top performers data available
                        </div>
                      ) : (
                        topStock.slice(0, 6).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border-b border-border hover:bg-accent/50 transition-colors last:border-b-0"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-foreground text-xs font-light tracking-[-0.01em] truncate">
                                {item.sku}
                              </div>
                              <div className="text-xs font-light tracking-[-0.01em] text-muted-foreground">
                                Revenue:{" "}
                                {formatCurrency(item.revenue, currency)}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-xs text-muted-foreground font-light tracking-[-0.01em]">
                                {item.sales} sold
                              </div>
                              <div className="text-xs text-foreground font-semibold tracking-[-0.01em]">
                                {item.daysOfStock.toFixed(1)}/day
                              </div>
                            </div>
                          </div>
                        ))
                      )}
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
