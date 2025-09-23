import { Database } from "src/lib/types";
import { ServiceBase } from "./base-service";
import { LibraryService } from "./library-service";

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
    options?: { offset?: number; limit?: number },
  ): Promise<Array<{ id: string; name: string; stock: number | null }>> {
    const userId = await this.getCurrentUserId(context);
    const { offset = 0, limit } = options || {};

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const userLibraries = await LibraryService.getUserLibraries(context);

        const { data: libraries, error } = await client.rpc(
          "get_user_libraries_with_stock",
          {
            p_user_id: userId,
            p_library_ids: userLibraries,
            p_offset: offset,
            p_limit: limit ?? undefined,
          },
        );

        if (error) throw error;
        if (!libraries) return [];

        return libraries as Array<{
          id: string;
          name: string;
          stock: number | null;
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
   * Get sets by library with stock totals
   */
  static async fetchSetsByLibrary(
    context: "client" | "server" = "client",
    libraryId: string,
    options?: {
      offset?: number;
      limit?: number;
    },
  ): Promise<Array<{ id: string; name: string; stock: number | null }>> {
    const userId = await this.getCurrentUserId(context);
    const { offset = 0, limit } = options || {};

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
          },
        );

        if (error) throw error;
        if (!sets) return [];

        return sets as Array<{
          id: string;
          name: string;
          stock: number | null;
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
    setId: string,
    options?: {
      offset?: number;
      limit?: number;
    },
  ): Promise<
    Array<
      Pick<CoreCard, "id" | "name" | "tcgplayer_id"> & { stock: number | null }
    >
  > {
    const userId = await this.getCurrentUserId(context);
    const { offset = 0, limit } = options || {};

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data: cards, error } = await client.rpc(
          "get_user_cards_with_stock",
          {
            p_user_id: userId,
            p_set_id: setId,
            p_offset: offset,
            p_limit: limit ?? undefined, // avoid passing NULL
          },
        );

        if (error) throw error;
        if (!cards) return [];

        return cards as Array<
          Pick<CoreCard, "id" | "name" | "tcgplayer_id"> & {
            stock: number | null;
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
  ): Promise<UserStockWithListings[]> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // Add explicit error handling for empty results
        const { data, error, count } = await client.rpc("get_card_stock", {
          p_user_id: userId,
          p_core_card_id: cardId,
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
   * Add new stock entry for a card
   */
  static async addStockEntry(
    context: "client" | "server" = "client",
    cardId: string,
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

        // TODO: Return success false so the UI can handle it
        if (error) throw error;
        // in case there is no error
        const { error: insertError } = await client
          .from("stock_audit_log")
          .insert({
            stock_id: data.id,
            user_id: userId,
            quantity_before: 0,
            quantity_after: stockData.quantity,
            change_type: "create",
            performed_by: userId,
          });

        if (insertError) throw insertError;

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
   * Search cards with stock to create transactions
   */
  static async searchCardsByName(
    context: "client" | "server",
    searchQuery: string,
  ): Promise<
    Array<{
      id: string;
      name: string;
      core_set_name: string | null;
      core_library_name: string | null;
      stock: number;
    }>
  > {
    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data, error } = await client.rpc("search_cards", {
          search_query: searchQuery,
        });

        console.log("RPC search_cards result:", data);

        if (error) throw error;

        // Normalize null to empty array
        const cards = data ?? [];

        // Ensure all fields match the RPC type exactly
        return cards.map((card: any) => ({
          id: String(card.id),
          name: String(card.name),
          core_set_name: card.core_set_name ?? null,
          core_library_name: card.core_library_name ?? null,
          stock: Number(card.stock ?? 0),
        }));
      },
      {
        service: "InventoryService",
        method: "searchCardsByName",
      },
    );
  }

  /**
   * Get list of available marketplaces
   */
  static async getAvailableMarketplaces(
    context: "client" | "server" = "client",
  ): Promise<string[]> {
    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data, error } = await client
          .from("marketplaces")
          .select("name")
          .order("name", { ascending: true });

        if (error) throw error;

        return (data || []).map((marketplace) => marketplace.name);
      },
      {
        service: "InventoryService",
        method: "getAvailableMarketplaces",
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
   * Get available conditions (hardcoded)
   */
  static async getAvailableConditions(
    context: "client" | "server" = "client",
  ): Promise<string[]> {
    // Flatten all conditions into a single array
    const tcgplayer = [
      "Near Mint",
      "Lightly Played",
      "Moderately Played",
      "Heavily Played",
      "Damaged",
    ];
    const cardmarket = [
      "Mint",
      "Near Mint",
      "Excellent",
      "Good",
      "Light Played",
      "Played",
      "Poor",
    ];

    // Merge and remove duplicates
    const allConditions = Array.from(new Set([...tcgplayer, ...cardmarket]));

    return allConditions;
  }

  /**
   * Get available languages (hardcoded)
   */
  static async getAvailableLanguages(
    context: "client" | "server" = "client",
  ): Promise<string[]> {
    return [
      "en", // English
      "fr", // French
      "de", // German
      "it", // Italian
      "pt", // Portuguese
      "es", // Spanish
      "ru", // Russian
      "ja", // Japanese
      "ko", // Korean
      "zh-CN", // Chinese (Simplified)
      "zh-TW", // Chinese (Traditional)
    ];
  }
}
