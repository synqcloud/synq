"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { IntegrationGrid } from "@/domains/integrations/components/integration-grid";
import { ShopifyDialog } from "@/domains/integrations/components/dialogs/shopify-dialog";
import { CardTraderDialog } from "@/domains/integrations/components/dialogs/card-trader-dialog";
import { ManapoolDialog } from "@/domains/integrations/components/dialogs/manapool-dialog";
import { useIntegrations } from "@/domains/integrations/hooks/use-integrations";
import { toast } from "sonner";

export default function IntegrationPage() {
  const searchParams = useSearchParams();
  const { installedIntegrations, loading, loadIntegrations, disconnect } =
    useIntegrations();

  const [showShopifyDialog, setShowShopifyDialog] = useState(false);
  const [showCardTraderDialog, setShowCardTraderDialog] = useState(false);
  const [showManapoolDialog, setShowManapoolDialog] = useState(false);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "shopify") {
      loadIntegrations();
    }
  }, [searchParams, loadIntegrations]);

  const handleConnectAction = (type: string) => {
    if (type === "shopify") setShowShopifyDialog(true);
    if (type === "cardtrader") setShowCardTraderDialog(true);
    if (type === "manapool") setShowManapoolDialog(true);
  };

  const handleSyncAction = async (type: string) => {
    const toastId = toast.loading("Syncing inventory", {
      description: `Fetching items from ${type}...`,
    });

    try {
      const response = await fetch(`/api/integrations/${type}/sync`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Sync failed");
      }

      const { stats } = data;
      const description = [
        `${stats.created} created, ${stats.updated} updated`,
        stats.skipped > 0 ? `${stats.skipped} skipped` : null,
        `(${(stats.duration_ms / 1000).toFixed(1)}s)`,
      ]
        .filter(Boolean)
        .join(" • ");

      toast.success("Sync completed", {
        id: toastId,
        description,
      });

      // Show warnings if any
      if (data.errors && data.errors.length > 0) {
        console.warn("Sync completed with errors:", data.errors);
        toast.warning("Sync completed with warnings", {
          description: `${data.errors.length} items had issues. Check console for details.`,
        });
      }
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error("Sync failed", {
        id: toastId,
        description:
          error instanceof Error ? error.message : "Failed to sync inventory",
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="h-full bg-background">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-normal tracking-tight mb-2">
            Integrations
          </h1>
          <p className="text-[13px] text-muted-foreground/80">
            Connect your store to sync inventory and orders
          </p>
        </div>

        <IntegrationGrid
          installedIntegrations={installedIntegrations}
          onConnectAction={handleConnectAction}
          onDisconnectAction={disconnect}
          onSyncAction={handleSyncAction}
          loading={loading}
        />
      </div>

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
      <ManapoolDialog
        open={showManapoolDialog}
        onOpenChange={setShowManapoolDialog}
        onSuccess={loadIntegrations}
      />
    </div>
  );
}
