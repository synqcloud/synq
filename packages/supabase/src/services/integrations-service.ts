import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

type Integration = Database["public"]["Tables"]["user_integrations"]["Row"];
type IntegrationInsert =
  Database["public"]["Tables"]["user_integrations"]["Insert"];
type IntegrationUpdate =
  Database["public"]["Tables"]["user_integrations"]["Update"];

export type IntegrationType =
  | "shopify"
  | "tcgplayer"
  | "cardmarket"
  | "ebay"
  | "amazon"
  | "manapool"
  | "cardtrader";

export type IntegrationStatus = "active" | "paused" | "error";

/**
 * Service to manage user integrations with marketplaces
 */
export class IntegrationsService extends ServiceBase {
  /**
   * Get all integrations for the current user
   */
  static async getIntegrations(
    context: "server" | "client" = "server",
  ): Promise<Integration[]> {
    const userId =  await this.getCurrentUserId(context);
    if (!userId) {
      throw new Error("Unable to fetch integrations: no current user found.");
    }
console.log("userId", userId);
    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client
          .from("user_integrations")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error)
          throw new Error(`Error fetching integrations: ${error.message}`);
        return data || [];
      },
      {
        service: "IntegrationsService",
        method: "getIntegrations",
        userId,
      },
    );
  }

  /**
   * Get a specific integration by type
   */
  static async getIntegration(
    integrationType: IntegrationType,
    context: "server" | "client" = "server",
  ): Promise<Integration | null> {
    const userId = await this.getCurrentUserId(context);
    if (!userId) {
      throw new Error("Unable to fetch integration: no current user found.");
    }

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client
          .from("user_integrations")
          .select("*")
          .eq("user_id", userId)
          .eq("integration_type", integrationType)
          .single();

        if (error && error.code !== "PGRST116") {
          throw new Error(`Error fetching integration: ${error.message}`);
        }
        return data;
      },
      {
        service: "IntegrationsService",
        method: "getIntegration",
        userId,
      },
    );
  }

  /**
   * Create a new integration
   */
  static async createIntegration(
    integrationType: IntegrationType,
    credentials: Record<string, any>,
    context: "server" | "client" = "server",
  ): Promise<Integration> {
    const userId = await this.getCurrentUserId(context);
    if (!userId) {
      throw new Error("Unable to create integration: no current user found.");
    }

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const newIntegration: IntegrationInsert = {
          user_id: userId,
          integration_type: integrationType,
          credentials,
          status: "active",
        };

        const { data, error } = await client
          .from("user_integrations")
          .insert(newIntegration)
          .select()
          .single();

        if (error)
          throw new Error(`Error creating integration: ${error.message}`);
        return data;
      },
      {
        service: "IntegrationsService",
        method: "createIntegration",
        userId,
      },
    );
  }

  /**
   * Update an existing integration
   */
  static async updateIntegration(
    integrationId: string,
    updates: IntegrationUpdate,
    context: "server" | "client" = "server",
  ): Promise<Integration> {
    const userId = await this.getCurrentUserId(context);
    if (!userId) {
      throw new Error("Unable to update integration: no current user found.");
    }

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client
          .from("user_integrations")
          .update(updates)
          .eq("id", integrationId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error)
          throw new Error(`Error updating integration: ${error.message}`);
        return data;
      },
      {
        service: "IntegrationsService",
        method: "updateIntegration",
        userId,
      },
    );
  }

  /**
   * Delete an integration
   */
  static async deleteIntegration(
    integrationId: string,
    context: "server" | "client" = "server",
  ): Promise<void> {
    const userId = await this.getCurrentUserId(context);
    if (!userId) {
      throw new Error("Unable to delete integration: no current user found.");
    }

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { error } = await client
          .from("user_integrations")
          .delete()
          .eq("id", integrationId)
          .eq("user_id", userId);

        if (error)
          throw new Error(`Error deleting integration: ${error.message}`);
      },
      {
        service: "IntegrationsService",
        method: "deleteIntegration",
        userId,
      },
    );
  }

  /**
   * Update the last synced timestamp
   */
  static async updateLastSynced(
    integrationId: string,
    context: "server" | "client" = "server",
  ): Promise<void> {
    const userId = await this.getCurrentUserId(context);
    if (!userId) {
      throw new Error("Unable to update sync time: no current user found.");
    }

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { error } = await client
          .from("user_integrations")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("id", integrationId)
          .eq("user_id", userId);

        if (error)
          throw new Error(`Error updating sync time: ${error.message}`);
      },
      {
        service: "IntegrationsService",
        method: "updateLastSynced",
        userId,
      },
    );
  }

  /**
   * Update integration status
   */
  static async updateStatus(
    integrationId: string,
    status: IntegrationStatus,
    context: "server" | "client" = "server",
  ): Promise<void> {
    const userId = await this.getCurrentUserId(context);
    if (!userId) {
      throw new Error("Unable to update status: no current user found.");
    }

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { error } = await client
          .from("user_integrations")
          .update({ status })
          .eq("id", integrationId)
          .eq("user_id", userId);

        if (error) throw new Error(`Error updating status: ${error.message}`);
      },
      {
        service: "IntegrationsService",
        method: "updateStatus",
        userId,
      },
    );
  }
}
