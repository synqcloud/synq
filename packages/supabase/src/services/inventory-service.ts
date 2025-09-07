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
  user_stock_listings?: UserStockListings[];
};

export class InventoryService extends ServiceBase {
  /**
   * Calculate total stock from an array of stock entries
   */
  private static calculateStock(
    stockEntries: Array<{ quantity: number | null }> | null,
  ): number {
    return (
      stockEntries?.reduce((sum, entry) => sum + (entry.quantity || 0), 0) || 0
    );
  }

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
  ): Promise<Array<{ id: string; name: string; stock: number }>> {
    const userId = await this.getCurrentUserId(context);
    const userLibraries = await LibraryService.getUserLibraries(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // First get all libraries the user has access to
        const { data: libraries, error: libError } = await client
          .from("core_libraries")
          .select("id, name")
          .in("id", userLibraries);

        if (libError) throw libError;

        // Then get stock data for these libraries
        const { data: stockData, error: stockError } = await client
          .from("user_card_stock")
          .select(
            `
            quantity,
            core_cards!inner(
              core_sets!inner(
                core_library_id
              )
            )
          `,
          )
          .eq("user_id", userId)
          .in("core_cards.core_sets.core_library_id", userLibraries);

        if (stockError) throw stockError;

        // Aggregate stock by library
        const libraryStockMap = new Map<string, number>();

        stockData?.forEach((stock: any) => {
          const libraryId = stock.core_cards.core_sets.core_library_id;
          const currentStock = libraryStockMap.get(libraryId) || 0;
          libraryStockMap.set(libraryId, currentStock + (stock.quantity || 0));
        });

        // Return all libraries with their stock (0 if no stock)
        return (libraries || []).map((library) => ({
          id: library.id,
          name: library.name,
          stock: libraryStockMap.get(library.id) || 0,
        }));
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
  ): Promise<Array<{ id: string; name: string; stock: number }>> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // First get all sets in the library
        const { data: sets, error: setsError } = await client
          .from("core_sets")
          .select("id, name")
          .eq("core_library_id", libraryId);

        if (setsError) throw setsError;

        // Then get stock data for these sets
        const { data: stockData, error: stockError } = await client
          .from("user_card_stock")
          .select(
            `
            quantity,
            core_cards!inner(
              core_set_id
            )
          `,
          )
          .eq("user_id", userId)
          .in(
            "core_cards.core_set_id",
            (sets || []).map((s) => s.id),
          );

        if (stockError) throw stockError;

        // Aggregate stock by set
        const setStockMap = new Map<string, number>();

        stockData?.forEach((stock: any) => {
          const setId = stock.core_cards.core_set_id;
          const currentStock = setStockMap.get(setId) || 0;
          setStockMap.set(setId, currentStock + (stock.quantity || 0));
        });

        // Return all sets with their stock (0 if no stock)
        return (sets || []).map((set) => ({
          id: set.id,
          name: set.name,
          stock: setStockMap.get(set.id) || 0,
        }));
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
  ): Promise<Array<{ id: string; name: string; stock: number }>> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // Get all cards in set with their stock
        const { data, error } = await client
          .from("core_cards")
          .select(
            `
            id,
            name,
            user_card_stock!left(quantity)
          `,
          )
          .eq("core_set_id", setId)
          .eq("user_card_stock.user_id", userId);

        if (error) throw error;

        return (data || []).map((card) => ({
          id: card.id,
          name: card.name,
          stock: this.calculateStock(card.user_card_stock as any),
        }));
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

        const { data, error } = await client.rpc("get_card_stock", {
          p_core_card_id: cardId,
        });

        if (error) throw error;

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
}
