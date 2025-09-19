// TODO: Refactor page
"use client";

import React, { useState, useMemo } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  HStack,
} from "@synq/ui/component";
import Image from "next/image";
import { Search, Zap } from "lucide-react";

// ---- Constant data declared once, not per render ----
const INTEGRATIONS = [
  {
    name: "CardTrader",
    description:
      "Enable syncing of inventory and listings with CardTrader to centralize stock and pricing.",
    icon_url: "/cardtrader.svg",
    category: "marketplace",
    isComingSoon: true,
    isInstalled: false,
  },
  {
    name: "TCGplayer",
    description:
      "Enable connection to TCGplayer seller accounts to centralize orders and product listings.",
    icon_url: "/tcgplayer.svg",
    category: "marketplace",
    isComingSoon: true,
    isInstalled: false,
  },
  {
    name: "Cardmarket",
    description:
      "Support Cardmarket listings and order management from a single place.",
    icon_url: "/cardmarket.svg",
    category: "marketplace",
    isComingSoon: true,
    isInstalled: false,
  },
  {
    name: "eBay",
    description:
      "Enable import and management of eBay listings and inventory in one interface.",
    icon_url: "/ebay.svg",
    category: "marketplace",
    isComingSoon: true,
    isInstalled: false,
  },
  {
    name: "Whatnot",
    description:
      "Support live-auction inventory and listings managed alongside other channels.",
    icon_url: "/whatnot.svg",
    category: "marketplace",
    isComingSoon: true,
    isInstalled: false,
  },
  {
    name: "Amazon",
    description:
      "Enable handling of Seller Central listings and inventory from a central dashboard.",
    icon_url: "/amazon.svg",
    category: "marketplace",
    isComingSoon: true,
    isInstalled: false,
  },
  {
    name: "Shopify",
    description:
      "Support syncing products, orders, and inventory with Shopify for centralized store management.",
    icon_url: "/shopify.svg",
    category: "ecommerce",
    isComingSoon: true,
    isInstalled: false,
  },
  {
    name: "QuickBooks",
    description:
      "Enable syncing of sales and transaction data to QuickBooks to simplify bookkeeping.",
    icon_url: "/quickbooks.svg",
    category: "accounting",
    isComingSoon: true,
    isInstalled: false,
  },
  {
    name: "Xero",
    description:
      "Support syncing invoices and financial data with Xero for streamlined accounting.",
    icon_url: "/xero.svg",
    category: "accounting",
    isComingSoon: true,
    isInstalled: false,
  },
];

const CATEGORY_TITLES: Record<string, string> = {
  marketplace: "Marketplace Sync",
  ecommerce: "E-commerce Platforms",
  accounting: "Accounting & Finance",
  productivity: "Productivity",
};

const CATEGORY_ORDER = [
  "marketplace",
  "ecommerce",
  "accounting",
  "productivity",
];

export default function IntegrationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // ---- Memoized derived data ----
  const filteredIntegrations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return INTEGRATIONS.filter((integration) => {
      const matchesSearch =
        q === "" || integration.name.toLowerCase().includes(q);
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "installed" && integration.isInstalled === true);
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  const groupedIntegrations = useMemo(() => {
    return filteredIntegrations.reduce(
      (acc, integration) => {
        (acc[integration.category] ||= []).push(integration);
        return acc;
      },
      {} as Record<string, typeof filteredIntegrations>,
    );
  }, [filteredIntegrations]);

  return (
    <div className="h-full flex flex-col">
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full h-full flex flex-col"
      >
        {/* Fixed Header with tabs and search */}
        <div className="flex-shrink-0 p-6 pb-4 border-b bg-background">
          <div className="flex flex-col sm:flex-row gap-4">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="all" className="font-light">
                All
              </TabsTrigger>
              <TabsTrigger value="installed" className="font-light">
                Installed
              </TabsTrigger>
            </TabsList>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search integrations"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search integrations"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          <TabsContent
            value="all"
            className="mt-0 p-6 pt-4 h-full tracking-normal font-light"
          >
            <IntegrationGrid grouped={groupedIntegrations} />
          </TabsContent>

          <TabsContent
            value="installed"
            className="mt-0 p-6 pt-4 h-full font-light"
          >
            <IntegrationGrid grouped={groupedIntegrations} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function IntegrationGrid({
  grouped,
}: {
  grouped: Record<string, typeof INTEGRATIONS>;
}) {
  return (
    <div className="space-y-8">
      {CATEGORY_ORDER.map((categoryKey) => {
        const categoryIntegrations = grouped[categoryKey];
        if (!categoryIntegrations || categoryIntegrations.length === 0)
          return null;

        return (
          <div key={categoryKey}>
            <h2 className="text-lg mb-4 text-foreground">
              {CATEGORY_TITLES[categoryKey]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.name}
                  name={integration.name}
                  description={integration.description}
                  icon_url={integration.icon_url}
                  isComingSoon={integration.isComingSoon}
                  isInstalled={integration.isInstalled}
                />
              ))}
            </div>
          </div>
        );
      })}
      {/* Empty state when nothing matches */}
      {Object.keys(grouped).length === 0 && (
        <div className="text-sm text-muted-foreground">
          No integrations found.
        </div>
      )}
    </div>
  );
}

function IntegrationCard({
  name,
  description,
  icon_url,
  isComingSoon = false,
  isInstalled = false,
}: {
  name: string;
  description: string;
  icon_url: string;
  isComingSoon?: boolean;
  isInstalled?: boolean;
}) {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <HStack align="center" gap={3}>
          <Image
            src={icon_url}
            width={40}
            height={40}
            alt={`${name} icon`}
            className="h-6 w-6 rounded-md"
          />
          <CardTitle className="text-lg font-light tracking-normal">
            {name}
          </CardTitle>
        </HStack>
      </CardHeader>

      <CardContent>
        <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {description}
        </CardDescription>

        <div className="mt-auto">
          <Button
            variant={isInstalled ? "secondary" : "default"}
            size="sm"
            className="w-full flex items-center gap-2"
            disabled={isComingSoon}
            aria-pressed={isInstalled}
            aria-disabled={isComingSoon}
          >
            {!isInstalled && <Zap className="h-4 w-4" />}
            {isComingSoon
              ? "Coming Soon"
              : isInstalled
                ? "Installed"
                : "Install"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
