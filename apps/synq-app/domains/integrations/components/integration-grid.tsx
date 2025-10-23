"use client";
import React from "react";
import { IntegrationCard } from "./integration-card";
import { INTEGRATIONS } from "../config/integrations.config";

interface IntegrationGridProps {
  installedIntegrations: string[];
  onConnectAction: (type: string) => void;
  onDisconnectAction: (type: string) => Promise<void>;
  onSyncAction?: (type: string) => Promise<void>;
  loading?: boolean;
}

export const IntegrationGrid: React.FC<IntegrationGridProps> = ({
  installedIntegrations,
  onConnectAction,
  onDisconnectAction,
  onSyncAction,
  loading,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {INTEGRATIONS.map((integration) => {
        const isInstalled = installedIntegrations.includes(integration.type);
        return (
          <IntegrationCard
            key={integration.name}
            integration={integration}
            isInstalled={isInstalled}
            onConnect={() => onConnectAction(integration.type)}
            onDisconnect={() => onDisconnectAction(integration.type)}
            onSync={onSyncAction}
            loading={loading}
          />
        );
      })}
    </div>
  );
};
