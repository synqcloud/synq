"use client";

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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatCurrency } from "../utils/format-currency";

interface MonthlyRevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  chartConfig: ChartConfig;
}

export function MonthlyRevenueChart({
  data,
  chartConfig,
}: MonthlyRevenueChartProps) {
  return (
    <div className="border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-foreground">
            Monthly Revenue & Profit
          </h2>
          <p className="text-sm text-muted-foreground">
            Revenue and profit trends for the last 5 months
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="5-months">
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3-months">Last 3 months</SelectItem>
              <SelectItem value="5-months">Last 5 months</SelectItem>
              <SelectItem value="12-months">Last 12 months</SelectItem>
              <SelectItem value="this-year">This year</SelectItem>
            </SelectContent>
          </Select>
          <button className="text-xs text-muted-foreground hover:text-foreground">
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
      <ChartContainer config={chartConfig} className="w-full h-[400px]">
        <BarChart
          accessibilityLayer
          data={data}
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
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <ChartTooltip
            cursor={{ strokeWidth: 1, stroke: "hsl(var(--border))" }}
            content={<ChartTooltipContent />}
          />
          <Bar
            dataKey="revenue"
            fill="hsl(var(--chart-1))"
            radius={[4, 4, 0, 0]}
            barSize={48}
            name="Revenue"
          />
          <Bar
            dataKey="profit"
            fill="hsl(var(--chart-2))"
            radius={[4, 4, 0, 0]}
            barSize={48}
            name="Profit"
          />
        </BarChart>
      </ChartContainer>
      <div className="flex items-center gap-6 mt-6">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-4 h-4 rounded-full"
            style={{ background: "hsl(var(--chart-1))" }}
          />
          <span className="text-sm text-muted-foreground">Revenue</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-4 h-4 rounded-full"
            style={{ background: "hsl(var(--chart-2))" }}
          />
          <span className="text-sm text-muted-foreground">Profit</span>
        </span>
      </div>
    </div>
  );
}
