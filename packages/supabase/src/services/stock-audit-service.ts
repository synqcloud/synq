import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

export type StockAuditLogItem = {
  id: string;
  created_at: string;
  change_type: string;
  quantity_before: number;
  quantity_after: number;
  message: string; // human-readable
  card_url: string; // clickable link to /inventory/items/:id
};

export class StockAuditLogService extends ServiceBase {
  /**
   * Returns human-readable stock audit logs for the current user.
   * Each record contains a clickable URL to the user's inventory item.
   */
  static async getUserAuditLogs(
    context: "server" | "client" = "server",
  ): Promise<StockAuditLogItem[]> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // Supabase query with deep joins
        const { data, error } = await client
          .from("stock_audit_log")
          .select(
            `
            id,
            created_at,
            change_type,
            quantity_before,
            quantity_after,
            user_card_stock!inner (
              id,
              core_card:core_cards!inner (
                name,
                core_set:core_sets!inner ( name ),
                core_library:core_libraries!inner ( name )
              )
            )
          `,
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform into front-end friendly format
        return (data ?? []).map((row: any) => {
          const card = row.user_card_stock.core_card;
          const setName = card.core_set.name;
          const libName = card.core_library.name;
          const cardName = card.name;
          const msg = this.buildMessage(
            row.change_type,
            cardName,
            libName,
            setName,
            row.quantity_before,
            row.quantity_after,
            row.created_at,
          );

          return {
            id: row.id,
            created_at: row.created_at,
            change_type: row.change_type,
            quantity_before: row.quantity_before,
            quantity_after: row.quantity_after,
            message: msg,
            card_url: `/inventory/items/${row.user_card_stock.id}`,
          } as StockAuditLogItem;
        });
      },
      {
        service: "StockAuditLogService",
        method: "getUserAuditLogs",
        userId: userId || undefined,
      },
    );
  }

  /** Helper to build human-readable string */
  private static buildMessage(
    type: string,
    cardName: string,
    libraryName: string,
    setName: string,
    before: number,
    after: number,
    createdAt: string,
  ): string {
    const base = `${cardName} (${libraryName} • ${setName})`;
    switch (type) {
      case "create":
        return `Created: Added ${base} with ${after} copy/copies (was ${before})`;
      case "sale":
        return `Sale: ${base} quantity ${before} → ${after}`;
      case "manual_edit":
        return `Manual edit: ${base} changed from ${before} to ${after}`;
      default:
        return `Update: ${base} quantity ${before} → ${after} (${type})`;
    }
  }
}
