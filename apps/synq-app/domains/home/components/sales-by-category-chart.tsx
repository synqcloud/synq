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
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { formatCurrency } from "../utils/format-currency";

interface SalesByCategoryChartProps {
  data: Array<{
    month: string;
    "TCG Products": number;
    Accessories: number;
    "Board Games": number;
    Supplies: number;
  }>;
  chartConfig: ChartConfig;
}

export function SalesByCategoryChart({
  data,
  chartConfig,
}: SalesByCategoryChartProps) {
  return (
    <div className="border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-foreground">
            Sales by Category
          </h2>
          <p className="text-sm text-muted-foreground">
            Monthly sales performance by product category
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
        </div>
      </div>
      <ChartContainer config={chartConfig} className="w-full h-[400px]">
        <LineChart
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
            dataKey="month"
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
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="TCG Products"
            stroke="hsl(var(--chart-1))"
            strokeWidth={3}
            dot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Accessories"
            stroke="hsl(var(--chart-2))"
            strokeWidth={3}
            dot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Board Games"
            stroke="hsl(var(--chart-3))"
            strokeWidth={3}
            dot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Supplies"
            stroke="hsl(var(--chart-4))"
            strokeWidth={3}
            dot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
