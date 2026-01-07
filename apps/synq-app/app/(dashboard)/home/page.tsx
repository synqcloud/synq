"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// Mock data - replace with actual API calls
const mockData = {
  inventoryValue: 18450,
  inventoryChange: 320,
  inventoryChangePercent: 1.8,
  pricesUpdated: 142,
  itemsNeedingAttention: 3,
  allPlatformsSynced: true,
  opportunities: [
    {
      id: 1,
      type: "underpriced",
      card: "Sheoldred, the Apocalypse",
      currentPrice: 45.99,
      suggestedPrice: 62.5,
      potentialProfit: 16.51,
      set: "DMU",
      rarity: "Mythic",
      stock: 3,
    },
    {
      id: 2,
      type: "underpriced",
      card: "The One Ring",
      currentPrice: 82.0,
      suggestedPrice: 115.0,
      potentialProfit: 33.0,
      set: "LTR",
      rarity: "Mythic",
      stock: 1,
    },
    {
      id: 3,
      type: "underpriced",
      card: "Urza's Saga",
      currentPrice: 45.0,
      suggestedPrice: 78.0,
      potentialProfit: 33.0,
      set: "MH2",
      rarity: "Rare",
      stock: 2,
    },
  ],
  totalOpportunityValue: 87.24,
  totalOpportunityCount: 127,
  overpriced: 3,
  perfectlyPriced: 2717,
  recentSales: [
    {
      card: "Ragavan, Nimble Pilferer",
      platform: "TCGPlayer",
      profit: 12.5,
      margin: 28,
      timeAgo: "2m ago",
    },
    {
      card: "Dockside Extortionist",
      platform: "eBay",
      profit: 8.25,
      margin: 22,
      timeAgo: "15m ago",
    },
  ],
};

export default function HomePage() {
  return (
    <div className="h-full w-full  bg-background overflow-scroll">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 overflow-scroll">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-6"
        >
          {/* Hero Greeting Card */}
          <motion.div variants={fadeInUp}>
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-2">
                    Good {getTimeOfDay()}! 👋
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base font-light">
                    Here's what's happening with your inventory
                  </p>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon="💰"
                  label="Inventory Value"
                  value={`$${mockData.inventoryValue.toLocaleString()}`}
                  change={`+$${mockData.inventoryChange}`}
                  changePercent={mockData.inventoryChangePercent}
                  positive={true}
                />
                <StatCard
                  icon="🔄"
                  label="Prices Updated"
                  value={mockData.pricesUpdated.toString()}
                  subtitle="overnight"
                  status="success"
                />
                <StatCard
                  icon="⚠️"
                  label="Need Attention"
                  value={mockData.itemsNeedingAttention.toString()}
                  subtitle="items"
                  status="warning"
                />
                <StatCard
                  icon="✓"
                  label="All Platforms"
                  value="Synced"
                  status="success"
                />
              </div>
            </div>
          </motion.div>

          {/* The "Holy Shit" Moment - Money on the Table */}
          <motion.div variants={fadeInUp}>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-2xl">
                    ✨
                  </div>
                  <div>
                    <h2 className="text-xl font-light tracking-tight text-foreground">
                      💰 You're leaving $
                      {mockData.totalOpportunityValue.toFixed(2)} on the table
                    </h2>
                    <p className="text-sm text-muted-foreground font-light mt-1">
                      {mockData.totalOpportunityCount} cards where you could
                      charge more
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Opportunities */}
              <div className="space-y-3">
                {mockData.opportunities.slice(0, 3).map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2.5 rounded-lg text-sm font-medium">
                  Update All
                </button>
                <button className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors px-4 py-2.5 rounded-lg text-sm font-medium">
                  Review One by One
                </button>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity & Warnings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Sales */}
            <motion.div variants={fadeInUp}>
              <div className="bg-card border border-border rounded-2xl p-6 h-full shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg text-xl">📈</div>
                  <div>
                    <h3 className="text-lg font-light tracking-tight text-foreground">
                      Recent Sales
                    </h3>
                    <p className="text-xs text-muted-foreground font-light">
                      Automated inventory updates
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {mockData.recentSales.map((sale, idx) => (
                    <SaleCard key={idx} sale={sale} />
                  ))}
                </div>

                <button className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 py-2">
                  View All Sales
                  <span>→</span>
                </button>
              </div>
            </motion.div>

            {/* Issues & Wins */}
            <motion.div variants={fadeInUp}>
              <div className="bg-card border border-border rounded-2xl p-6 h-full shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg text-xl">📦</div>
                  <div>
                    <h3 className="text-lg font-light tracking-tight text-foreground">
                      Quick Actions
                    </h3>
                    <p className="text-xs text-muted-foreground font-light">
                      Things you should know
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <ActionCard
                    type="warning"
                    icon="⚠️"
                    title={`${mockData.overpriced} cards overpriced`}
                    subtitle="Unlikely to sell at current price"
                    action="Review"
                  />
                  <ActionCard
                    type="success"
                    icon="✓"
                    title={`${mockData.perfectlyPriced.toLocaleString()} cards perfectly priced`}
                    subtitle="No action needed"
                  />
                  <ActionCard
                    type="info"
                    icon="🔥"
                    title="Duskmourn prices surging"
                    subtitle="+15% average increase this week"
                    action="View Cards"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  icon,
  label,
  value,
  change,
  changePercent,
  subtitle,
  status,
  positive,
}: any) {
  return (
    <div className="bg-background/50 border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-muted-foreground font-light tracking-tight">
          {label}
        </span>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-light tracking-tight text-foreground">
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1">
            <span
              className={`text-xs font-medium ${positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {change} ({changePercent}%)
            </span>
          </div>
        )}
        {subtitle && (
          <span className="text-xs text-muted-foreground font-light">
            {subtitle}
          </span>
        )}
        {status === "success" && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 dark:text-green-400 font-light">
              Active
            </span>
          </div>
        )}
        {status === "warning" && subtitle && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }: any) {
  return (
    <div className="bg-background border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="text-sm font-medium text-foreground truncate">
              {opportunity.card}
            </h4>
            <span className="text-xs text-muted-foreground font-light shrink-0">
              {opportunity.set} · {opportunity.rarity}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span>
              Your price:{" "}
              <span className="text-foreground font-medium">
                ${opportunity.currentPrice}
              </span>
            </span>
            <span>→</span>
            <span>
              Suggested:{" "}
              <span className="text-primary font-medium">
                ${opportunity.suggestedPrice}
              </span>
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-green-600 dark:text-green-400 font-medium text-sm">
            +${opportunity.potentialProfit.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            {opportunity.stock} in stock
          </div>
        </div>
      </div>
    </div>
  );
}

function SaleCard({ sale }: any) {
  return (
    <div className="bg-background border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-medium text-foreground truncate">
              {sale.card}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">
              {sale.platform}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span>Inventory reduced everywhere</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-green-600 dark:text-green-400 font-medium text-sm">
            +${sale.profit}
          </div>
          <div className="text-xs text-muted-foreground">
            {sale.margin}% margin
          </div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">{sale.timeAgo}</span>
      </div>
    </div>
  );
}

function ActionCard({ type, icon, title, subtitle, action }: any) {
  const colors = {
    warning: "border-yellow-500/20 bg-yellow-500/5",
    success: "border-green-500/20 bg-green-500/5",
    info: "border-blue-500/20 bg-blue-500/5",
  };

  return (
    <div
      className={`border rounded-xl p-4 ${colors[type as keyof typeof colors]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{icon}</span>
            <span className="text-sm font-medium text-foreground">{title}</span>
          </div>
          <p className="text-xs text-muted-foreground font-light">{subtitle}</p>
        </div>
        {action && (
          <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0">
            {action}
          </button>
        )}
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
