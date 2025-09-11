import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

export type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];

export type EnrichedNotification = NotificationRow & {
  stock: {
    id: string;
    core_card: {
      name: string;
    };
  };
  audit: {
    id: string;
  };
  marketplace: {
    id: string;
    name: string;
  };
};

export class NotificationsService extends ServiceBase {
  /**
   * Get count of unread notifications for badge indicator
   */
  static async getUnreadNotificationCount(
    context: "server" | "client" = "client",
  ): Promise<number> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { count, error } = await client
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_read", false);

        if (error) throw error;
        return count || 0;
      },
      {
        service: "NotificationsService",
        method: "getUnreadNotificationCount",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Fetch user notifications with enriched info using optimized joins
   */
  static async getUserNotifications(
    context: "server" | "client" = "client",
  ): Promise<EnrichedNotification[]> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // Single query with proper joins to get card name from core_cards table
        const { data: notifications, error } = await client
          .from("notifications")
          .select(
            `
            id,
            user_id,
            stock_id,
            stock_audit_id,
            marketplace_id,
            notification_type,
            is_read,
            created_at,
            stock:user_card_stock!stock_id(
              id,
              core_card:core_cards!core_card_id(
                name
              )
            ),
            audit:stock_audit_log!stock_audit_id(
              id
            ),
            marketplace:marketplaces!marketplace_id(
              id,
              name
            )
          `,
          )
          .eq("user_id", userId)
          .eq("is_read", false)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        if (!notifications || notifications.length === 0) return [];

        // Transform to match expected interface
        // Transform to match expected interface
        const enriched: EnrichedNotification[] = notifications.map((n) => {
          const stock = Array.isArray(n.stock) ? n.stock[0] : n.stock;
          const audit = Array.isArray(n.audit) ? n.audit[0] : n.audit;
          const marketplace = Array.isArray(n.marketplace)
            ? n.marketplace[0]
            : n.marketplace;

          return {
            ...n,
            stock: stock
              ? ({
                  id: stock.id,
                  core_card: Array.isArray(stock.core_card)
                    ? stock.core_card[0]
                    : stock.core_card,
                } as { id: string; core_card: { name: string } })
              : (undefined as any),
            audit: audit as { id: string },
            marketplace: marketplace as { id: string; name: string },
          };
        });

        return enriched;
      },
      {
        service: "NotificationsService",
        method: "getUserNotifications",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Mark a notification as read (completed)
   */
  static async markNotificationAsRead(
    context: "server" | "client" = "client",
    notificationId: string,
  ): Promise<boolean> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { error } = await client
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId)
          .eq("user_id", userId);

        if (error) throw error;
        return true;
      },
      {
        service: "NotificationsService",
        method: "markNotificationAsRead",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllNotificationsAsRead(
    context: "server" | "client" = "client",
  ): Promise<boolean> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { error } = await client
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", userId)
          .eq("is_read", false);

        if (error) throw error;
        return true;
      },
      {
        service: "NotificationsService",
        method: "markAllNotificationsAsRead",
        userId: userId || undefined,
      },
    );
  }
}
