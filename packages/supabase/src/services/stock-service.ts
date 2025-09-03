import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

export type UserStockUpdate =
  Database["public"]["Tables"]["user_stock_updates"]["Row"];

export type StockUpdateWithCard = UserStockUpdate & {
  core_card_id: string;
  card_name: string;
  set_name: string;
  game_name: string;
  condition?: string;
  grading?: string;
  language?: string;
  sku?: string;
  location?: string;
};
export interface StockFilters {
  startDate?: Date;
  endDate?: Date;
}

export class StockService extends ServiceBase {
  /**
   * Fetch stock updates along with card info, with optional date filters
   */
  static async fetchUserStockUpdatesWithCard(
    context: "server" | "client" = "server",
    filters?: StockFilters,
  ): Promise<StockUpdateWithCard[]> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        let query = client
          .from("user_stock_updates")
          .select(
            `
            *,
            user_card_stock (
              core_card_id,
              condition,
              grading,
              language,
              sku,
              location,
              core_cards!inner (
                name,
                core_set_id,
                core_library_id,
                core_sets(name),
                core_libraries(name)
              )
            )
          `,
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        // Apply date filters
        if (filters?.startDate) {
          query = query.gte("created_at", filters.startDate.toISOString());
        }
        if (filters?.endDate) {
          query = query.lte("created_at", filters.endDate.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        return (data ?? []).map((u: any) => ({
          ...u,
          core_card_id: u.user_card_stock?.core_card_id,
          card_name: u.user_card_stock?.core_cards?.name ?? "Unknown",
          set_name: u.user_card_stock?.core_cards?.core_sets?.name ?? "Unknown",
          game_name:
            u.user_card_stock?.core_cards?.core_libraries?.name ?? "Unknown",
          condition: u.user_card_stock?.condition ?? undefined,
          grading: u.user_card_stock?.grading ?? undefined,
          language: u.user_card_stock?.language ?? undefined,
          sku: u.user_card_stock?.sku ?? undefined,
          location: u.user_card_stock?.location ?? undefined,
        }));
      },
      {
        service: "StockService",
        method: "fetchUserStockUpdatesWithCard",
        userId: userId || undefined,
      },
    );
  }
}
