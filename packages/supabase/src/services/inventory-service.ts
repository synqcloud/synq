import { Database } from "src/lib/types";
import { ServiceBase } from "./base-service";
export type CoreLibrary = Database["public"]["Tables"]["core_libraries"]["Row"];
export type CoreSet = Database["public"]["Tables"]["core_sets"]["Row"];
export type CoreCard = Database["public"]["Tables"]["core_cards"]["Row"];
export type UserStock = Database["public"]["Tables"]["user_card_stock"]["Row"];
export type UserStockListings =
  Database["public"]["Tables"]["user_stock_listings"]["Row"];

export type PublicCard = CoreCard & UserStock;

// Enhanced UserStock type with marketplace listings
export type UserStockWithListings = UserStock & {
  marketplaces?: string[];
  marketplace_prices?: Record<string, number | null>;
};

export class InventoryService extends ServiceBase {
  /**
   * Get card details with stock information
   */
  static async getSingleCardDetails(
    context: "client" | "server" = "client",
    coreCardId: string,
  ): Promise<PublicCard> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client
          .from("core_cards")
          .select(
            `
            *,
            user_card_stock!left(*)
          `,
          )
          .eq("id", coreCardId)
          .eq("user_card_stock.user_id", userId)
          .single();

        if (error) throw error;
        return data;
      },
      {
        service: "InventoryService",
        method: "getSingleCardDetails",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Get user's core libraries with stock totals
   */
  static async getUserCoreLibrary(
    context: "client" | "server" = "client",
    options?: {
      offset?: number;
      limit?: number;
      stockFilter?: "all" | "in-stock" | "out-of-stock";
    },
  ): Promise<
    Array<{
      id: string;
      name: string;
      stock: number | null;
      total_value: number | null;
    }>
  > {
    const userId = await this.getCurrentUserId(context);
    const { offset = 0, limit, stockFilter = "all" } = options || {};

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data: libraries, error } = await client.rpc(
          "get_user_libraries_with_stock",
          {
            p_user_id: userId,
            p_offset: offset,
            p_limit: limit ?? undefined, // don't pass null
            p_stock_filter: stockFilter,
          },
        );

        if (error) throw error;
        return (libraries ?? []) as Array<{
          id: string;
          name: string;
          stock: number | null;
          total_value: number | null;
        }>;
      },
      {
        service: "InventoryService",
        method: "getUserCoreLibrary",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Get user's core libraries with stock totals
   */
  static async getCoreLibraries(
    context: "client" | "server" = "client",
  ): Promise<
    Array<{
      id: string;
      name: string;
    }>
  > {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data: libraries, error } = await client
          .from("core_libraries")
          .select(`id, name`);

        if (error) throw error;
        return (libraries ?? []) as Array<{
          id: string;
          name: string;
        }>;
      },
      {
        service: "InventoryService",
        method: "getCoreLibrary",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Get sets by library with stock totals
   */
  static async fetchSetsByLibrary(
    context: "client" | "server" = "client",
    libraryId: string | null,
    options?: {
      offset?: number;
      limit?: number;
      stockFilter?: "all" | "in-stock" | "out-of-stock";
    },
  ): Promise<
    Array<{
      id: string;
      name: string;
      stock: number | null;
      is_upcoming: boolean;
      total_value: number | null;
    }>
  > {
    const userId = await this.getCurrentUserId(context);
    const { offset = 0, limit, stockFilter = "all" } = options || {};

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data: sets, error } = await client.rpc(
          "get_user_sets_with_stock",
          {
            p_user_id: userId,
            p_library_id: libraryId,
            p_offset: offset,
            p_limit: limit ?? undefined, // don't pass null
            p_stock_filter: stockFilter,
          },
        );

        if (error) throw error;
        return (sets ?? []) as Array<{
          id: string;
          name: string;
          stock: number | null;
          total_value: number | null;
          is_upcoming: boolean;
        }>;
      },
      {
        service: "InventoryService",
        method: "fetchSetsByLibrary",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Get cards by set with stock totals
   */
  static async fetchCardsBySet(
    context: "client" | "server" = "client",
    setId: string | null,
    options?: {
      offset?: number;
      limit?: number;
      stockFilter?: "all" | "in-stock" | "out-of-stock";
    },
  ): Promise<
    Array<
      Pick<
        CoreCard,
        | "id"
        | "name"
        | "tcgplayer_id"
        | "image_url"
        | "rarity"
        | "collector_number"
      > & {
        stock: number | null;
        tcgplayer_price: number;
      }
    >
  > {
    const userId = await this.getCurrentUserId(context);
    const { offset = 0, limit, stockFilter = "all" } = options || {};

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data: cards, error } = await client.rpc(
          "get_user_cards_with_stock",
          {
            p_user_id: userId,
            p_set_id: setId,
            p_offset: offset,
            p_limit: limit ?? undefined, // avoid passing null
            p_stock_filter: stockFilter,
            p_sort_by: "collector_number",
          },
        );

        if (error) throw error;
        return (cards ?? []) as Array<
          Pick<
            CoreCard,
            | "id"
            | "name"
            | "tcgplayer_id"
            | "image_url"
            | "rarity"
            | "collector_number"
          > & {
            stock: number | null;
            tcgplayer_price: number;
          }
        >;
      },
      {
        service: "InventoryService",
        method: "fetchCardsBySet",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Get stock entries for a specific card with marketplace listings
   */
  static async fetchStockByCard(
    context: "client" | "server" = "client",
    cardId: string,
    isActive: boolean = true,
  ): Promise<UserStockWithListings[]> {
    const userId = await this.getCurrentUserId(context);
    console.log("Current user:", userId);
    return this.execute(
      async () => {
        const client = await this.getClient(context);
        // Add explicit error handling for empty results
        const { data, error, count } = await client.rpc("get_card_stock", {
          p_user_id: userId,
          p_core_card_id: cardId,
          p_is_active: isActive,
        });
        if (error) {
          // Handle the specific PGRST116 error
          if (error.code === "PGRST116") {
            return []; // Return empty array for no results
          }
          throw error;
        }
        return data || [];
      },
      {
        service: "InventoryService",
        method: "fetchStockByCard",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Get stock entries for a specific card with marketplace listings
   */
  static async fetchInventoryTableSummary(
    context: "client" | "server" = "client",
  ): Promise<{
    total_items: number | null;
    total_stock: number | null;
    total_inventory_value: number | null;
  }> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // Add explicit error handling for empty results
        const { data, error } = await client.rpc("get_user_inventory_summary", {
          p_user_id: userId,
        });

        if (error) {
          throw error;
        }

        return data[0];
      },
      {
        service: "InventoryService",
        method: "fetchInventoryTableSummary",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Add new stock entry for a card
   * @param createTransaction - If false, skip transaction creation
   */
  static async addStockEntry(
    context: "client" | "server" = "client",
    cardId: string,
    transaction: {
      source: string;
      tax_amount?: number;
      shipping_amount?: number;
      performed_by?: string;
    } | null,
    stockData: {
      quantity: number;
      condition?: string;
      cost?: number;
      sku?: string;
      location?: string;
      language?: string;
    },
  ): Promise<string> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // Insert stock entry
        const { data, error } = await client
          .from("user_card_stock")
          .insert({
            user_id: userId,
            core_card_id: cardId,
            quantity: stockData.quantity,
            condition: stockData.condition || null,
            cogs: stockData.cost || null,
            sku: stockData.sku || null,
            location: stockData.location || null,
            language: stockData.language || null,
          })
          .select("id")
          .single();

        if (error) throw error;

        // Only create transaction if transaction data is provided
        if (transaction !== null) {
          // Calculate amounts
          const subtotalAmount = stockData.quantity * (stockData.cost || 0);
          const taxAmount = transaction.tax_amount || 0;
          const shippingAmount = transaction.shipping_amount || 0;
          const netAmount = subtotalAmount + taxAmount + shippingAmount;

          // Use "manual" as default source if none provided
          const source = transaction.source || "manual";

          // Insert transaction
          const { data: transactionData, error: transError } = await client
            .from("user_transaction")
            .insert({
              user_id: userId,
              transaction_status: "COMPLETED",
              transaction_type: "purchase",
              performed_by: userId,
              source: source,
              is_integration: false,
              subtotal_amount: subtotalAmount,
              tax_amount: taxAmount,
              shipping_amount: shippingAmount,
              net_amount: netAmount,
            })
            .select()
            .single();

          if (transError) throw transError;

          // Insert transaction items
          const { data: insertedItems, error: itemsError } = await client
            .from("user_transaction_items")
            .insert({
              transaction_id: transactionData.id,
              stock_id: data.id,
              quantity: stockData.quantity,
              unit_price: stockData.cost || 0,
            })
            .select();

          if (itemsError) throw itemsError;
        }

        return data.id;
      },
      {
        service: "InventoryService",
        method: "addStockEntry",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Update stock record via Edge function
   */
  static async updateStockViaEdge(
    context: "client" | "server" = "client",
    stockId: string,
    data: {
      change_type: "manual_edit" | "delete" | "inventory_adjustment";
      quantity_change?: number;
      quantity_new?: number;
      condition?: string | null;
      cost?: number | null;
      sku?: string | null;
      location?: string | null;
      language?: string | null;
    },
  ) {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const response = await fetch("/api/inventory/stock-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stock_id: stockId,
            performed_by: userId,
            ...data,
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

          return { success: false, error: normalizedError };
        }

        return { success: true, data: result };
      },
      {
        service: "InventoryService",
        method: "updateStockViaEdge",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Search cards by library without stock filters.
   */
  static async searchCardsByLibrary(
    context: "client" | "server" = "client",
    libraryId: string,
    searchQuery: string,
    options?: {
      offset?: number;
      limit?: number;
    },
  ): Promise<
    Array<
      Pick<
        CoreCard,
        | "id"
        | "name"
        | "tcgplayer_id"
        | "image_url"
        | "rarity"
        | "collector_number"
      > & {
        core_set_name: string;
        stock: number | null;
      }
    >
  > {
    const { offset = 0, limit } = options || {};

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data, error } = await client.rpc("search_cards_by_library", {
          p_library_id: libraryId,
          p_search_query: searchQuery,
          p_offset: offset,
          p_limit: limit ?? 50,
        });

        if (error) throw error;

        return (data ?? []) as Array<
          Pick<
            CoreCard,
            | "id"
            | "name"
            | "tcgplayer_id"
            | "image_url"
            | "rarity"
            | "collector_number"
          > & {
            core_set_name: string;
            stock: number | null;
          }
        >;
      },
      {
        service: "InventoryService",
        method: "searchCardsByLibrary",
      },
    );
  }

  /**
   * Search cards with stock to create transactions
   */
  static async searchCardsByName(
    context: "client" | "server" = "client",
    searchQuery: string,
    options?: {
      offset?: number;
      limit?: number;
      stockFilter?: "all" | "in-stock" | "out-of-stock";
      libraryId?: string;
    },
  ): Promise<
    Array<
      Pick<
        CoreCard,
        | "id"
        | "name"
        | "tcgplayer_id"
        | "image_url"
        | "rarity"
        | "collector_number"
      > & {
        stock: number | null;
        tcgplayer_price: number | null;
        core_set_name: string;
        core_library_name: string;
      }
    >
  > {
    const userId = await this.getCurrentUserId(context);
    const { offset = 0, limit, stockFilter = "all" } = options || {};

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data: cards, error } = await client.rpc(
          "get_user_cards_with_stock",
          {
            p_user_id: userId,
            p_library_id: options?.libraryId,
            p_set_id: null, // no specific set
            p_search_query: searchQuery,
            p_offset: offset,
            p_limit: limit ?? null,
            p_stock_filter: stockFilter,
          },
        );

        if (error) throw error;

        return (cards ?? []) as Array<
          Pick<
            CoreCard,
            | "id"
            | "name"
            | "tcgplayer_id"
            | "image_url"
            | "rarity"
            | "collector_number"
          > & {
            stock: number | null;
            tcgplayer_price: number | null;
            core_set_name: string;
            core_library_name: string;
          }
        >;
      },
      {
        service: "InventoryService",
        method: "searchCardsByName",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Add marketplace to stock item
   */
  static async addMarketplaceToStock(
    context: "client" | "server" = "client",
    stockId: string,
    marketplace: string,
  ): Promise<void> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // First, get the marketplace ID by name
        const { data: marketplaceData, error: marketplaceError } = await client
          .from("marketplaces")
          .select("id")
          .eq("name", marketplace)
          .single();

        if (marketplaceError) throw marketplaceError;

        // Create a new listing for this stock item and marketplace
        const { error: listingError } = await client
          .from("user_stock_listings")
          .insert({
            stock_id: stockId,
            marketplace_id: marketplaceData.id,
          });

        if (listingError) throw listingError;
      },
      {
        service: "InventoryService",
        method: "addMarketplaceToStock",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Remove marketplace from stock item
   */
  static async removeMarketplaceFromStock(
    context: "client" | "server" = "client",
    stockId: string,
    marketplace: string,
  ): Promise<void> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // First, get the marketplace ID by name
        const { data: marketplaceData, error: marketplaceError } = await client
          .from("marketplaces")
          .select("id")
          .eq("name", marketplace)
          .single();

        if (marketplaceError) throw marketplaceError;

        // Delete the listing for this stock item and marketplace
        const { error: deleteError } = await client
          .from("user_stock_listings")
          .delete()
          .eq("stock_id", stockId)
          .eq("marketplace_id", marketplaceData.id);

        if (deleteError) throw deleteError;
      },
      {
        service: "InventoryService",
        method: "removeMarketplaceFromStock",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Get available marketplaces (hardcoded instead of DB)
   */
  static async getAvailableMarketplaces(
    context: "client" | "server" = "client",
  ): Promise<string[]> {
    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // First, get the marketplace ID by name
        const { data: marketplaceData, error: marketplaceError } = await client
          .from("marketplaces")
          .select("name");

        return marketplaceData?.map((m) => m.name) || [];
      },
      {
        service: "InventoryService",
        method: "getAvailableMarketplaces",
      },
    );
  }
}
