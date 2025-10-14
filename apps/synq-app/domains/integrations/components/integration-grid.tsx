"use client";

import React from "react";
import { IntegrationCard } from "./integration-card";
import { INTEGRATIONS } from "../config/integrations.config";

interface IntegrationGridProps {
  installedIntegrations: string[];
  onConnect: (type: string) => void;
  onDisconnect: (type: string) => Promise<void>;
  onViewInventory?: () => void;
  loading?: boolean;
}

export const IntegrationGrid: React.FC<IntegrationGridProps> = ({
  installedIntegrations,
  onConnect,
  onDisconnect,
  onViewInventory,
  loading,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {INTEGRATIONS.map((integration) => {
        const isInstalled = installedIntegrations.includes(integration.type);

        return (
          <IntegrationCard
            key={integration.name}
            integration={integration}
            isInstalled={isInstalled}
            onConnect={() => onConnect(integration.type)}
            onDisconnect={() => onDisconnect(integration.type)}
            onViewInventory={onViewInventory}
            loading={loading}
          />
        );
      })}
    </div>
  );
};
