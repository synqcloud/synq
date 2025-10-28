import { useState, useEffect } from "react";
import { IntegrationsService } from "@synq/supabase/services";

export const useIntegrations = () => {
  const [installedIntegrations, setInstalledIntegrations] = useState<string[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const loadIntegrations = async () => {
    try {
      const integrations = await IntegrationsService.getIntegrations("client");
      setInstalledIntegrations(integrations.map((i) => i.integration_type));
    } catch (error) {
      console.error("Failed to load integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async (type: string): Promise<void> => {
    if (!confirm(`Are you sure you want to disconnect ${type}?`)) {
      return; // Just return without a value
    }

    try {
      const integrations = await IntegrationsService.getIntegrations("client");
      const integration = integrations.find((i) => i.integration_type === type);

      if (integration) {
        await IntegrationsService.deleteIntegration(integration.id, "client");
        await loadIntegrations();
      }
    } catch (error) {
      console.error("Failed to disconnect:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  return { installedIntegrations, loading, loadIntegrations, disconnect };
};
