"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@synq/ui/component";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { formatCurrency } from "../utils/format-currency";

interface ChartsProps {
  chartData: {
    date: string;
    collectionValue: number;
    stockValue: number;
    stockInvestment: number;
  }[];
  personalCollectionValue: number;
  totalMarketValue: number;
}

type ChartDataPoint = {
  date: string;
  collectionValue: number;
  stockValue: number;
  stockInvestment: number;
};

export default function Charts({
  chartData,
  personalCollectionValue,
  totalMarketValue,
}: ChartsProps) {
  const formatTooltipValue = (value: any): number => {
    if (typeof value === "number") return value;
    return 0;
  };

  return (
    <>
      {/* Collection Value Chart */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-medium">
            Collection Value Trend
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm text-muted-foreground">Last 30 days</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="collectionValue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "currentColor" }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  content={({
                    active,
                    payload,
                  }: TooltipProps<number, string>) => {
                    if (active && payload?.[0]?.payload) {
                      const data = payload[0].payload as ChartDataPoint;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Date
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {data.date}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Value
                              </span>
                              <span className="font-bold">
                                {formatCurrency(
                                  formatTooltipValue(payload[0]?.value),
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="collectionValue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#collectionValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stock Profit Chart */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-medium">
            Stock Profit Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-muted-foreground">Value</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-gray-500" />
              <span className="text-sm text-muted-foreground">Investment</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis
                  className="text-xs text-muted-foreground"
                  tick={{ fill: "currentColor" }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  content={({
                    active,
                    payload,
                  }: TooltipProps<number, string>) => {
                    if (active && payload?.[0]?.payload) {
                      const data = payload[0].payload as ChartDataPoint;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Date
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {data.date}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Value
                              </span>
                              <span className="font-bold text-emerald-500">
                                {formatCurrency(
                                  formatTooltipValue(payload[0]?.value),
                                )}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Investment
                              </span>
                              <span className="font-bold text-gray-500">
                                {formatCurrency(
                                  formatTooltipValue(payload[1]?.value),
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="stockValue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="stockInvestment"
                  stroke="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
