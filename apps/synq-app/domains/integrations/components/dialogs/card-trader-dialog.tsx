"use client";

import React, { useState } from "react";
import { Button, Input, Label } from "@synq/ui/component";
import { ExternalLink } from "lucide-react";
import { BaseConnectionDialog } from "./base-connect-dialog";
import { useIntegrationConnect } from "../../hooks/use-integration-connect";

interface CardTraderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
}

export const CardTraderDialog: React.FC<CardTraderDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [token, setToken] = useState("");
  const { connect, connecting, error, setError } = useIntegrationConnect();

  const handleConnect = async () => {
    if (!token.trim()) return;

    try {
      await connect({
        endpoint: "/api/integrations/cardtrader/connect",
        payload: { apiToken: token },
        onSuccess,
      });
      setToken("");
      onOpenChange(false);
      alert("CardTrader connected successfully!");
    } catch (error) {
      // Error is already set in the hook
    }
  };

  return (
    <BaseConnectionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Connect CardTrader Account"
      description="Enter your CardTrader API token to connect your account"
    >
      <div className="space-y-2">
        <Label htmlFor="api-token">API Token</Label>
        <Input
          id="api-token"
          type="password"
          placeholder="Enter your CardTrader API token"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setError("");
          }}
          disabled={connecting}
        />
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            Get your API token from your{" "}
            <a
              href="https://www.cardtrader.com/full_api_app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              CardTrader settings page
            </a>
          </div>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <Button
        className="w-full"
        onClick={handleConnect}
        disabled={!token.trim() || connecting}
      >
        {connecting ? "Connecting..." : "Connect to CardTrader"}
      </Button>
    </BaseConnectionDialog>
  );
};
