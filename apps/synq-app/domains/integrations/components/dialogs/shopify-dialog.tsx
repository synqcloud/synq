"use client";

import React, { useState } from "react";
import { Button, Input, Label } from "@synq/ui/component";
import { BaseConnectionDialog } from "./base-connect-dialog";
import { useIntegrationConnect } from "../../hooks/use-integration-connect";

interface ShopifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
}

export const ShopifyDialog: React.FC<ShopifyDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [shopUrl, setShopUrl] = useState("");
  const { connect, connecting, error, setError } = useIntegrationConnect();

  const handleConnect = async () => {
    if (!shopUrl.trim()) return;

    try {
      await connect({
        endpoint: "/api/integrations/shopify/connect",
        payload: { shop: shopUrl },
        onSuccess,
      });
      setShopUrl("");
      onOpenChange(false);
    } catch (error) {
      // Error is already set in the hook
    }
  };

  return (
    <BaseConnectionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Connect Shopify Store"
      description="Enter your Shopify store URL to connect your inventory"
    >
      <div className="space-y-2">
        <Label htmlFor="shop-url">Shop URL</Label>
        <Input
          id="shop-url"
          placeholder="mystore.myshopify.com"
          value={shopUrl}
          onChange={(e) => {
            setShopUrl(e.target.value);
            setError("");
          }}
          disabled={connecting}
        />
        <p className="text-xs text-muted-foreground">
          Enter your store's myshopify.com URL
        </p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <Button
        className="w-full"
        onClick={handleConnect}
        disabled={!shopUrl.trim() || connecting}
      >
        {connecting ? "Connecting..." : "Connect to Shopify"}
      </Button>
    </BaseConnectionDialog>
  );
};
