"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@synq/ui/component";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@synq/ui/component";
import { formatCurrency } from "../utils/format-currency";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@synq/ui/utils";
import { Lock } from "lucide-react";

interface ChartsWrapperProps {
  chartData: {
    date: string;
    collectionValue: number;
    stockValue: number;
    stockInvestment: number;
  }[];
  personalCollectionValue: number;
  totalMarketValue: number;
}

export default function ChartsWrapper({
  chartData,
  personalCollectionValue,
  totalMarketValue,
}: ChartsWrapperProps) {
  const chartConfig = {
    collectionValue: {
      label: "Collection Value",
      theme: {
        light: "#3b82f6",
        dark: "#3b82f6",
      },
    },
    stockValue: {
      label: "Stock Value",
      theme: {
        light: "#10b981",
        dark: "#10b981",
      },
    },
    stockInvestment: {
      label: "Investment",
      theme: {
        light: "#6b7280",
        dark: "#6b7280",
      },
    },
  };

  const renderTooltip = React.useCallback(({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <ChartTooltipContent
        active={active}
        payload={payload.map((item: any) => ({
          ...item,
          value: Number(item.value),
          dataKey: item.dataKey,
          name: item.name,
          payload: item.payload,
        }))}
        formatter={(value) => formatCurrency(value as number)}
      />
    );
  }, []);

  const renderLegend = React.useCallback((props: any) => {
    return <ChartLegendContent {...props} />;
  }, []);

  // Calculate the percentage change
  const calculatePercentageChange = (data: typeof chartData) => {
    if (!data || data.length < 2) return 0;
    const firstValue = data[0]?.collectionValue ?? 0;
    const lastValue = data[data.length - 1]?.collectionValue ?? 0;
    if (firstValue === 0) return 0;
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const percentageChange = calculatePercentageChange(chartData);

  return (
    <>
      {/* Collection Value Chart */}
      <Card className="bg-card relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-medium">
            Collection Value Trend
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm text-muted-foreground">Last 30 days</span>
            <span
              className={cn(
                "text-sm font-medium",
                percentageChange >= 0 ? "text-emerald-500" : "text-red-500",
              )}
            >
              {percentageChange >= 0 ? "+" : ""}
              {percentageChange.toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] relative">
            <div className="absolute inset-0 backdrop-blur-sm bg-background/50 z-10 flex items-center justify-center">
              <div className="text-center">
                <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Coming Soon
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Analytics features are being developed
                </p>
              </div>
            </div>
            <ChartContainer config={chartConfig}>
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    className="text-xs text-muted-foreground"
                    tick={{ fill: "currentColor" }}
                  />
                  <YAxis
                    className="text-xs text-muted-foreground"
                    tick={{ fill: "currentColor" }}
                    tickFormatter={(value) => formatCurrency(value)}
                    domain={["auto", "auto"]}
                  />
                  <ChartTooltip content={renderTooltip} />
                  <Area
                    type="monotone"
                    dataKey="collectionValue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#collectionValue)"
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stock Profit Chart */}
      <Card className="bg-card relative">
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
          <div className="h-[300px] relative">
            <div className="absolute inset-0 backdrop-blur-sm bg-background/50 z-10 flex items-center justify-center">
              <div className="text-center">
                <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Coming Soon
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Analytics features are being developed
                </p>
              </div>
            </div>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    className="text-xs text-muted-foreground"
                    tick={{ fill: "currentColor" }}
                  />
                  <YAxis
                    className="text-xs text-muted-foreground"
                    tick={{ fill: "currentColor" }}
                    tickFormatter={(value) => formatCurrency(value)}
                    domain={["auto", "auto"]}
                  />
                  <ChartTooltip content={renderTooltip} />
                  <Line
                    type="monotone"
                    dataKey="stockValue"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                  <Line
                    type="monotone"
                    dataKey="stockInvestment"
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
