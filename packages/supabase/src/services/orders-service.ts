import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

export type UserOrder = Database["public"]["Tables"]["user_orders"]["Row"];
export type UserOrderItem =
  Database["public"]["Tables"]["user_order_items"]["Row"];
export type OrderStatus =
  Database["public"]["Tables"]["user_orders"]["Row"]["order_status"];
export type ProductType =
  Database["public"]["Views"]["user_order_items_with_cards"]["Row"];
export type ProductTypePartial = Pick<
  ProductType,
  | "item_id"
  | "quantity"
  | "core_card_id"
  | "card_name"
  | "unit_price"
  | "set_name"
  | "game_name"
  | "condition"
  | "grading"
  | "language"
  | "sku"
  | "location"
>;
export type OrderWithQuantity = UserOrder & {
  total_quantity: number;
};

interface OrderFilters {
  statuses?: OrderStatus[];
  sources?: string[];
  integrationOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class OrderService extends ServiceBase {
  /**
   * Fetch user orders with search by card name
   */
  static async fetchUserOrders(
    context: "server" | "client" = "server",
    filters?: OrderFilters,
  ): Promise<Array<OrderWithQuantity>> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);
        // Call RPC function to get orders with total_quantity already calculated
        const { data, error } = await client.rpc("get_user_orders", {
          p_user_id: userId,
          p_start_date: filters?.startDate?.toISOString() ?? null,
          p_end_date: filters?.endDate?.toISOString() ?? null,
          p_statuses: filters?.statuses ?? null,
        });
        if (error) throw error;
        // data already contains totalQuantity as number, ready to use
        return data ?? [];
      },
      {
        service: "OrderService",
        method: "fetchUserOrders",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Fetch order items for a specific order
   */
  static async fetchUserOrderItems(
    context: "server" | "client",
    orderId: string,
  ): Promise<Array<ProductTypePartial>> {
    const userId = await this.getCurrentUserId(context);
    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client
          .from("user_order_items_with_cards")
          .select(
            "item_id, quantity, core_card_id, card_name, unit_price, set_name, game_name, condition, grading, language, sku, location",
          )
          .eq("order_id", orderId);
        if (error) throw error;
        return data;
      },
      {
        service: "OrderService",
        method: "fetchUserOrderItems",
        userId: userId || undefined,
      },
    );
  }
}
