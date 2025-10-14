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
import { Zap, Package } from "lucide-react";
import { IntegrationConfig } from "../config/integrations.config";

interface IntegrationCardProps {
  integration: IntegrationConfig;
  isInstalled: boolean;
  onConnect: () => void;
  onDisconnect: () => Promise<void>;
  onViewInventory?: () => void;
  loading?: boolean;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  isInstalled,
  onConnect,
  onDisconnect,
  onViewInventory,
  loading = false,
}) => {
  const [disconnecting, setDisconnecting] = React.useState(false);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await onDisconnect();
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          <HStack align="center" gap={2.5}>
            <Image
              src={integration.icon_url}
              width={36}
              height={36}
              alt={`${integration.name} icon`}
              className="h-9 w-9 rounded-md"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold mb-0.5">
                {integration.name}
              </CardTitle>
              {isInstalled ? (
                <p className="text-xs text-green-600 font-medium">Connected</p>
              ) : integration.isComingSoon ? (
                <p className="text-xs text-gray-500">Coming soon</p>
              ) : (
                <p className="text-xs text-gray-500">Not connected</p>
              )}
            </div>
          </HStack>

          <CardDescription className="text-xs text-gray-600 leading-relaxed">
            {integration.description}
          </CardDescription>

          <div className="flex gap-2">
            {isInstalled ? (
              <>
                {integration.type === "cardtrader" && onViewInventory && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={onViewInventory}
                  >
                    <Package className="h-3.5 w-3.5 mr-1.5" />
                    View Matches
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 text-xs ${integration.type === "cardtrader" && onViewInventory ? "flex-1" : "w-full"}`}
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? "Disconnecting..." : "Settings"}
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="w-full h-8 text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 border-0"
                disabled={integration.isComingSoon || loading}
                onClick={onConnect}
              >
                {integration.isComingSoon ? (
                  "Coming Soon"
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 mr-1.5" />
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
