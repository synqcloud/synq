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
  | "language"
  | "sku"
  | "location"
>;

export type TransactionWithQuantity = UserTransaction & {
  total_quantity: number;
};

interface TransactionFilters {
  statuses?: TransactionStatus[];
  sources?: string[];
  integrationOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
}

// Types for creating transactions
export interface CreateTransactionData {
  transaction_status: TransactionStatus;
  source?: string;
  performed_by?: string;
  subtotal_amount: number;
  tax_amount?: number;
  shipping_amount?: number;
  net_amount: number;
  is_integration?: boolean;
}

export interface CreateTransactionItemData {
  stock_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateTransactionRequest {
  transaction: CreateTransactionData;
  items: CreateTransactionItemData[];
}

export class TransactionService extends ServiceBase {
  /**
   * Create a sale transaction (via edge function)
   */
  static async createSaleTransactionUsingEdge(
    context: "server" | "client" = "server",
    data: {
      source: string;
      items: CreateTransactionItemData[];
      tax_amount?: number;
      shipping_amount?: number;
      performed_by?: string;
    },
  ): Promise<{ transaction: UserTransaction; items: UserTransactionItem[] }> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const response = await fetch("/api/transactions/create-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            change_type: "sale",
            marketplace: data.source,
            performed_by: data.performed_by || userId,
            tax_amount: data.tax_amount ?? 0,
            shipping_amount: data.shipping_amount ?? 0,
            net_amount:
              data.items.reduce(
                (sum, item) => sum + item.quantity * item.unit_price,
                0,
              ) +
              (data.tax_amount ?? 0) +
              (data.shipping_amount ?? 0),
            items: data.items,
          }),
        });

        let result: any = {};
        try {
          result = await response.json();
        } catch {
          // fallback
        }

        if (!response.ok || !result.success) {
          const normalizedError =
            result?.error ||
            (response.status === 409
              ? "duplicate"
              : response.status === 400
                ? "invalid_input"
                : "server_error");
          throw new Error(normalizedError);
        }

        return {
          transaction: result.transaction as UserTransaction,
          items: (result.items ?? []) as UserTransactionItem[],
        };
      },
      {
        service: "TransactionService",
        method: "createSaleTransactionUsingEdge",
        userId: userId || undefined,
      },
    );
  }

  static async createTransaction(
    context: "server" | "client" = "server",
    data: CreateTransactionRequest,
  ): Promise<{ transaction: UserTransaction; items: UserTransactionItem[] }> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // Start a transaction to ensure atomicity
        const { data: transactionData, error: transactionError } = await client
          .from("user_transaction")
          .insert({
            user_id: userId,
            transaction_status: data.transaction.transaction_status,
            transaction_type: "sale", // Always sale
            performed_by: data.transaction.performed_by || userId,
            source: data.transaction.source || null,
            subtotal_amount: data.transaction.subtotal_amount,
            tax_amount: data.transaction.tax_amount || 0,
            shipping_amount: data.transaction.shipping_amount || 0,
            net_amount: data.transaction.net_amount,
            is_integration: data.transaction.is_integration || false,
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // Insert transaction items
        const itemsToInsert = data.items.map((item) => ({
          transaction_id: transactionData.id,
          stock_id: item.stock_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));

        const { data: itemsData, error: itemsError } = await client
          .from("user_transaction_items")
          .insert(itemsToInsert)
          .select();

        if (itemsError) throw itemsError;

        return {
          transaction: transactionData,
          items: itemsData || [],
        };
      },
      {
        service: "TransactionService",
        method: "createTransaction",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Create a sale transaction (convenience method)
   */
  static async createSaleTransaction(
    context: "server" | "client" = "server",
    data: {
      source: string;
      items: CreateTransactionItemData[];
      tax_amount?: number;
      shipping_amount?: number;
      performed_by?: string;
    },
  ): Promise<{ transaction: UserTransaction; items: UserTransactionItem[] }> {
    // Calculate subtotal from items
    const subtotal_amount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );

    const tax_amount = data.tax_amount || 0;
    const shipping_amount = data.shipping_amount || 0;
    const net_amount = subtotal_amount + tax_amount + shipping_amount;

    return this.createTransaction(context, {
      transaction: {
        transaction_status: "COMPLETED",
        source: data.source,
        performed_by: data.performed_by,
        subtotal_amount,
        tax_amount,
        shipping_amount,
        net_amount,
        is_integration: false,
      },
      items: data.items,
    });
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    context: "server" | "client" = "server",
    transactionId: string,
    status: TransactionStatus,
  ): Promise<UserTransaction> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data, error } = await client
          .from("user_transaction")
          .update({ transaction_status: status })
          .eq("id", transactionId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      {
        service: "TransactionService",
        method: "updateTransactionStatus",
        userId: userId || undefined,
      },
    );
  }

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
        const { data, error } = await client.rpc("get_user_transactions", {
          p_user_id: userId,
          p_start_date: filters?.startDate?.toISOString() ?? null,
          p_end_date: filters?.endDate?.toISOString() ?? null,
          p_statuses: filters?.statuses ?? null,
          p_types: null, // No longer needed since all transactions are sales
          p_offset: 0,
          p_limit: null,
        });

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
   * Fetch user transactions page (paginated)
   */
  static async fetchUserTransactionsPage(
    context: "server" | "client" = "server",
    params?: {
      filters?: TransactionFilters;
      offset?: number;
      limit?: number | null;
    },
  ): Promise<Array<TransactionWithQuantity>> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client.rpc("get_user_transactions", {
          p_user_id: userId,
          p_start_date: params?.filters?.startDate?.toISOString() ?? null,
          p_end_date: params?.filters?.endDate?.toISOString() ?? null,
          p_statuses: params?.filters?.statuses ?? null,
          p_types: null,
          p_offset: params?.offset ?? 0,
          p_limit: params?.limit ?? null,
        });

        if (error) throw error;
        return data ?? [];
      },
      {
        service: "TransactionService",
        method: "fetchUserTransactionsPage",
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
            "item_id, quantity, core_card_id, card_name, unit_price, set_name, game_name, condition, language, cogs, sku, location",
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
