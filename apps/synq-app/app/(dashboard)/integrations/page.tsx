"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@synq/ui/component";
import { Package } from "lucide-react";

import { IntegrationGrid } from "@/domains/integrations/components/integration-grid";
import { ShopifyDialog } from "@/domains/integrations/components/dialogs/shopify-dialog";
import { CardTraderDialog } from "@/domains/integrations/components/dialogs/card-trader-dialog";
import { InventoryDialog } from "@/domains/integrations/components/inventory/inventory-dialog";
import { useIntegrations } from "@/domains/integrations/hooks/use-integrations";
import { useInventory } from "@/domains/integrations/hooks/use-inventory";

export default function IntegrationPage() {
  const searchParams = useSearchParams();
  const { installedIntegrations, loading, loadIntegrations, disconnect } =
    useIntegrations();
  const {
    inventory,
    stats,
    loading: loadingInventory,
    error: inventoryError,
    loadInventory,
  } = useInventory();

  const [showShopifyDialog, setShowShopifyDialog] = useState(false);
  const [showCardTraderDialog, setShowCardTraderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "shopify") {
      loadIntegrations();
    }
  }, [searchParams, loadIntegrations]);

  const handleConnect = (type: string) => {
    if (type === "shopify") setShowShopifyDialog(true);
    if (type === "cardtrader") setShowCardTraderDialog(true);
  };

  const handleViewInventory = async () => {
    setShowInventoryDialog(true);
    await loadInventory("/api/integrations/cardtrader/sync");
  };

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(cents / 100);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="h-full p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-light mb-2">Integrations</h1>
          <p className="text-sm text-muted-foreground">
            Connect your store to sync inventory and orders
          </p>
        </div>
      </div>

      <IntegrationGrid
        installedIntegrations={installedIntegrations}
        onConnect={handleConnect}
        onDisconnect={async (type: string) => {
          await disconnect(type);
        }}
        onViewInventory={handleViewInventory}
        loading={loading}
      />

      <ShopifyDialog
        open={showShopifyDialog}
        onOpenChange={setShowShopifyDialog}
        onSuccess={loadIntegrations}
      />

      <CardTraderDialog
        open={showCardTraderDialog}
        onOpenChange={setShowCardTraderDialog}
        onSuccess={loadIntegrations}
      />

      <InventoryDialog
        open={showInventoryDialog}
        onOpenChange={setShowInventoryDialog}
        items={inventory}
        stats={stats}
        loading={loadingInventory}
        error={inventoryError}
        formatPrice={formatPrice}
      />
    </div>
  );
}
