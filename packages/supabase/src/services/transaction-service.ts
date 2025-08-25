import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

export type UserTransaction =
  Database["public"]["Tables"]["user_transactions"]["Row"];

export type UserTransactionItem =
  Database["public"]["Tables"]["user_transaction_items"]["Row"];

export class TransactionService extends ServiceBase {
  /**
   * Fetch user transactions including total quantity per transaction
   */
  static async fetchUserTransactions(
    context: "server" | "client" = "server",
  ): Promise<(UserTransaction & { totalQuantity: number })[]> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client
          .from("user_transactions")
          .select(
            `
             *,
             user_transaction_items (quantity)
           `,
          )
          .eq("user_id", userId)
          .order("created_at");

        if (error) throw error;

        return (data ?? []).map((tx) => ({
          ...tx,
          totalQuantity:
            tx.user_transaction_items?.reduce(
              (sum, item) => sum + item.quantity,
              0,
            ) ?? 0,
        }));
      },
      {
        service: "TransactionService",
        method: "fetchUserTransactions",
        userId: userId || undefined,
      },
    );
  }

  static async fetchUserTransactionItems(
    context: "server" | "client",
    transactionId: string,
  ): Promise<
    { id: string; quantity: number; core_card_id: string; card_name: string }[]
  > {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client
          .from("user_transaction_items_with_cards")
          .select("item_id, quantity, core_card_id, card_name, unit_price")
          .eq("transaction_id", transactionId);

        if (error) throw error;

        // Map the data to a simpler shape for the popover
        return (data ?? []).map((item) => ({
          id: item.item_id,
          quantity: item.quantity,
          core_card_id: item.core_card_id,
          unit_price: item.unit_price,
          card_name: item.card_name,
        }));
      },
      {
        service: "TransactionService",
        method: "fetchUserTransactionItems",
        userId: userId || undefined,
      },
    );
  }
}
