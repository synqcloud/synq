import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

export type UserTransaction =
  Database["public"]["Tables"]["user_transaction"]["Row"];
export type UserTransactionItem =
  Database["public"]["Tables"]["user_transaction_items"]["Row"];
export type TransactionStatus =
  Database["public"]["Tables"]["user_transaction"]["Row"]["transaction_status"];
export type TransactionType =
  Database["public"]["Tables"]["user_transaction"]["Row"]["transaction_type"];
export type ProductType =
  Database["public"]["Views"]["user_transaction_items_with_cards"]["Row"];

export type ProductTypePartial = Pick<
  ProductType,
  | "item_id"
  | "quantity"
  | "core_card_id"
  | "card_name"
  | "unit_price"
  | "set_name"
  | "game_name"
  | "cogs"
  | "condition"
  | "grading"
  | "language"
  | "sku"
  | "location"
>;

export type TransactionWithQuantity = UserTransaction & {
  total_quantity: number;
};

interface TransactionFilters {
  statuses?: TransactionStatus[];
  types?: TransactionType[];
  sources?: string[];
  integrationOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class TransactionService extends ServiceBase {

  /**
   * Fetch user's unique marketplaces using direct query (alternative to RPC)
   */
  static async fetchUserMarketplaces(
    context: "server" | "client" = "server",
  ): Promise<string[]> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data, error } = await client
          .from("user_transaction")
          .select("source")
          .eq("user_id", userId)
          .not("source", "is", null)
          .order("source");

        if (error) throw error;

        // Extract unique sources
        const uniqueSources = Array.from(
          new Set(data?.map((row) => row.source).filter(Boolean) || []),
        ).sort();

        return uniqueSources;
      },
      {
        service: "TransactionService",
        method: "fetchUserMarketplaces",
        userId: userId || undefined,
      },
    );
  }
  /**
   * Fetch user transactions with filters
   */
  static async fetchUserTransactions(
    context: "server" | "client" = "server",
    filters?: TransactionFilters,
  ): Promise<Array<TransactionWithQuantity>> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);
        // Call RPC function to get transactions with total_quantity already calculated
        const { data, error } = await client
          .rpc("get_user_transactions", {
            p_user_id: userId,
            p_start_date: filters?.startDate?.toISOString() ?? null,
            p_end_date: filters?.endDate?.toISOString() ?? null,
            p_statuses: filters?.statuses ?? null,
            p_types: filters?.types ?? null,
          })
          .limit(10);
        if (error) throw error;
        return data ?? [];
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
  ): Promise<Array<ProductTypePartial>> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client
          .from("user_transaction_items_with_cards")
          .select(
            "item_id, quantity, core_card_id, card_name, unit_price, set_name, game_name, condition, grading, language, cogs, sku, location",
          )
          .eq("transaction_id", transactionId);
        if (error) throw error;
        return data;
      },
      {
        service: "TransactionService",
        method: "fetchUserTransactionItems",
        userId: userId || undefined,
      },
    );
  }
}
