import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

export type UserTransaction =
  Database["public"]["Tables"]["user_transactions"]["Row"];
export type UserTransactionItem =
  Database["public"]["Tables"]["user_transaction_items"]["Row"];
export type TransactionType =
  Database["public"]["Tables"]["user_transactions"]["Row"]["transaction_type"];

export type TransactionWithQuantity = UserTransaction & {
  totalQuantity: number;
};

interface TransactionFilters {
  types?: TransactionType[];
  sources?: string[];
  integrationOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}

export class TransactionService extends ServiceBase {
  /**
   * Fetch user transactions with search by card name
   */
  static async fetchUserTransactions(
    context: "server" | "client" = "server",
    filters?: TransactionFilters,
  ): Promise<TransactionWithQuantity[]> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // If searching by card name, use the view to get transaction IDs first
        let transactionIds: string[] | undefined;

        if (filters?.searchQuery) {
          const searchResult = await client
            .from("user_transaction_items_with_cards")
            .select("transaction_id")
            .ilike("card_name", `%${filters.searchQuery}%`);

          if (searchResult.error) throw searchResult.error;

          transactionIds = [
            ...new Set(searchResult.data.map((item) => item.transaction_id)),
          ];

          // If no transactions found with search term, return empty array
          if (transactionIds.length === 0) {
            return [];
          }
        }

        // Build main query
        let query = client
          .from("user_transactions")
          .select(`*, user_transaction_items(quantity)`)
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        // Apply filters
        if (transactionIds) {
          query = query.in("id", transactionIds);
        }

        if (filters?.types?.length) {
          query = query.in("transaction_type", filters.types);
        }

        if (filters?.startDate) {
          query = query.gte("created_at", filters.startDate.toISOString());
        }

        if (filters?.endDate) {
          query = query.lte("created_at", filters.endDate.toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;

        // Calculate total quantities
        return (data ?? []).map((tx) => ({
          ...tx,
          totalQuantity:
            tx.user_transaction_items?.reduce(
              (sum: number, item: any) => sum + (item.quantity || 0),
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

  /**
   * Fetch transaction items for a specific transaction
   */
  static async fetchUserTransactionItems(
    context: "server" | "client",
    transactionId: string,
  ): Promise<
    Array<{
      id: string;
      quantity: number;
      core_card_id: string;
      card_name: string;
      unit_price: number;
    }>
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
