"use client";
import React, { useState } from "react";
import { Button, Input, Label } from "@synq/ui/component";
import { ExternalLink } from "lucide-react";
import { BaseConnectionDialog } from "./base-connect-dialog";
import { useIntegrationConnect } from "../../hooks/use-integration-connect";

interface ManapoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
}

export const ManapoolDialog: React.FC<ManapoolDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const { connect, connecting, error, setError } = useIntegrationConnect();

  const handleConnect = async () => {
    if (!email.trim() || !accessToken.trim()) return;

    try {
      await connect({
        endpoint: "/api/integrations/manapool/connect",
        payload: { email, accessToken },
        onSuccess,
      });
      setEmail("");
      setAccessToken("");
      onOpenChange(false);
      alert("Manapool connected successfully!");
    } catch (error) {
      // Error is already set in the hook
    }
  };

  return (
    <BaseConnectionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Connect Manapool Account"
      description="Enter your Manapool email and access token to connect your account"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your Manapool email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={connecting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="access-token">Access Token</Label>
          <Input
            id="access-token"
            type="password"
            placeholder="Enter your Manapool access token"
            value={accessToken}
            onChange={(e) => {
              setAccessToken(e.target.value);
              setError("");
            }}
            disabled={connecting}
          />
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            Get your email and access token from your{" "}
            <a
              href="https://manapool.com/seller/integrations/manapool-api"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Manapool settings page
            </a>{" "}
            under "API Access"
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <Button
        className="w-full"
        onClick={handleConnect}
        disabled={!email.trim() || !accessToken.trim() || connecting}
      >
        {connecting ? "Connecting..." : "Connect to Manapool"}
      </Button>
    </BaseConnectionDialog>
  );
};
