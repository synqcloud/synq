import { Database } from "src/lib/types";
import { ServiceBase } from "./base-service";
import { LibraryService } from "./library-service";
import { sumNestedQuantities } from "src/lib/utils";

export type CoreLibrary = Database["public"]["Tables"]["core_libraries"]["Row"];
export type CoreSet = Database["public"]["Tables"]["core_sets"]["Row"];
export type CoreCard = Database["public"]["Tables"]["core_cards"]["Row"];
export type UserStock = Database["public"]["Tables"]["user_card_stock"]["Row"];

export type PublicCard = CoreCard & UserStock;

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
  ): Promise<Array<{ id: string; name: string; stock: number }>> {
    const userId = await this.getCurrentUserId(context);
    const userLibraries = await LibraryService.getUserLibraries(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data: libraries, error: libError } = await client
          .from("core_libraries")
          .select("id, name")
          .in("id", userLibraries);
        if (libError) throw libError;

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

        // Aggregate stock by library using utility function
        const libraryStockMap = new Map<string, number>();
        stockData?.forEach((stock: any) => {
          const libraryId = stock.core_cards.core_sets.core_library_id;
          const currentStock = libraryStockMap.get(libraryId) || 0;
          libraryStockMap.set(libraryId, currentStock + (stock.quantity || 0));
        });

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

        const { data: sets, error: setsError } = await client
          .from("core_sets")
          .select("id, name")
          .eq("core_library_id", libraryId);
        if (setsError) throw setsError;

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

        const setStockMap = new Map<string, number>();
        stockData?.forEach((stock: any) => {
          const setId = stock.core_cards.core_set_id;
          const currentStock = setStockMap.get(setId) || 0;
          setStockMap.set(setId, currentStock + (stock.quantity || 0));
        });

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
   * Get cards by set with stock totals using sumNestedQuantities
   */
  static async fetchCardsBySet(
    context: "client" | "server" = "client",
    setId: string,
  ): Promise<Array<{ id: string; name: string; stock: number }>> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data, error } = await client
          .from("core_cards")
          .select(
            `
            id,
            name,
            user_card_stock!left(*)
          `,
          )
          .eq("core_set_id", setId)
          .eq("user_card_stock.user_id", userId);
        if (error) throw error;

        return (data || []).map((card) => ({
          id: card.id,
          name: card.name,
          stock: sumNestedQuantities(card.user_card_stock, "", "quantity"),
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
   * Get stock entries for a specific card
   */
  static async fetchStockByCard(
    context: "client" | "server" = "client",
    cardId: string,
  ): Promise<UserStock[]> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client
          .from("user_card_stock")
          .select("*")
          .eq("core_card_id", cardId)
          .eq("user_id", userId);
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
}
