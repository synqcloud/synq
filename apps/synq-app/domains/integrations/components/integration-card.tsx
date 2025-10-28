"use client";
import React from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  HStack,
} from "@synq/ui/component";
import Image from "next/image";
import { Zap, Package, RefreshCw } from "lucide-react";
import { IntegrationConfig } from "../config/integrations.config";

interface IntegrationCardProps {
  integration: IntegrationConfig;
  isInstalled: boolean;
  onConnect: () => void;
  onDisconnect: () => Promise<void>;
  onSync?: (type: string) => Promise<void>;
  loading?: boolean;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  isInstalled,
  onConnect,
  onDisconnect,
  onSync,
  loading = false,
}) => {
  const [disconnecting, setDisconnecting] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);

  const handleDisconnect = async () => {
    if (!confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      return;
    }

    setDisconnecting(true);
    try {
      await onDisconnect();
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSync = async () => {
    if (!onSync) return;

    setSyncing(true);
    try {
      await onSync(integration.type);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="h-full border-border/40 shadow-none hover:border-border/60 transition-colors">
      <CardContent className="p-5">
        <div className="space-y-4">
          <HStack align="center" gap={3}>
            <Image
              src={integration.icon_url}
              width={40}
              height={40}
              alt={`${integration.name} icon`}
              className="h-10 w-10 rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-[15px] font-medium mb-1">
                {integration.name}
              </CardTitle>
              {isInstalled ? (
                <HStack align="center" gap={2}>
                  <p className="text-[13px] text-[hsl(var(--chart-3))] font-normal">
                    Connected
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-accent/50"
                    onClick={handleSync}
                    disabled={syncing || !onSync}
                    title="Sync inventory"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
                    />
                  </Button>
                </HStack>
              ) : integration.isComingSoon ? (
                <p className="text-[13px] text-muted-foreground/70">
                  Coming soon
                </p>
              ) : (
                <p className="text-[13px] text-muted-foreground/70">
                  Not connected
                </p>
              )}
            </div>
          </HStack>
          <CardDescription className="text-[13px] leading-relaxed text-muted-foreground/80">
            {integration.description}
          </CardDescription>
          <div className="flex gap-2 pt-1">
            {isInstalled ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-[13px] font-normal border-border/60 hover:bg-accent/50 hover:text-accent-foreground"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="w-full h-9 text-[13px] font-normal bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={integration.isComingSoon || loading}
                onClick={onConnect}
              >
                {integration.isComingSoon ? (
                  "Coming Soon"
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 mr-2" />
                    Install
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
