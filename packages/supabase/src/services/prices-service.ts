import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

export class PriceService extends ServiceBase {
  /**
   * Add a price alert for a user on a specific card
   */
  static async addPriceAlert(
    cardId: string,
    context: "server" | "client" = "client",
  ): Promise<boolean> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { error } = await client.from("user_card_price_alerts").insert({
          user_id: userId,
          core_card_id: cardId,
        });

        if (error) throw error;
        return true;
      },
      {
        service: "PriceService",
        method: "addPriceAlert",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Remove a price alert for a user on a specific card
   */
  static async removePriceAlert(
    cardId: string,
    context: "server" | "client" = "client",
  ): Promise<boolean> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { error } = await client
          .from("user_card_price_alerts")
          .delete()
          .eq("user_id", userId)
          .eq("core_card_id", cardId);

        if (error) throw error;
        return true;
      },
      {
        service: "PriceService",
        method: "removePriceAlert",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Check if user has a price alert set for a specific card
   */
  static async hasUserPriceAlert(
    cardId: string,
    context: "server" | "client" = "client",
  ): Promise<boolean> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client
          .from("user_card_price_alerts")
          .select("user_id")
          .eq("user_id", userId)
          .eq("core_card_id", cardId)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // No alert found
            return false;
          }
          throw error;
        }
        return !!data;
      },
      {
        service: "PriceService",
        method: "hasUserPriceAlert",
        userId: userId || undefined,
      },
    );
  }
}
