import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

type PublicSchema = Database["public"];

export type MonthlyData =
  PublicSchema["Functions"]["get_user_sales_dashboard"]["Returns"][0]["monthly"];
export type TopStockData =
  PublicSchema["Functions"]["get_user_sales_dashboard"]["Returns"][0]["top_stock"];

export type UserDashboardData = {
  monthly: MonthlyData[];
  top_stock: TopStockData[];
};

/**
 * Service to fetch user dashboard data
 */
export class DashboardService extends ServiceBase {
  /**
   * Fetch the sales dashboard data for the user
   * @param context - server or client
   * @param months - number of months to fetch for monthly P&L (top stock is always all-time)
   */
  static async fetchUserDashboard(
    context: "server" | "client" = "server",
    months: number = 5,
  ): Promise<UserDashboardData> {
    const userId = await this.getCurrentUserId(context);

    if (!userId) {
      throw new Error("Unable to fetch dashboard: no current user found.");
    }

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        const { data, error } = await client.rpc("get_user_sales_dashboard", {
          p_user_id: userId,
          p_months: months,
        });

        if (error)
          throw new Error(`RPC error fetching dashboard: ${error.message}`);

        const result = data?.[0] ?? { monthly: [], top_stock: [] };

        return {
          monthly: result.monthly as MonthlyData[],
          top_stock: result.top_stock as TopStockData[],
        };
      },
      {
        service: "DashboardService",
        method: "fetchUserDashboard",
        userId,
      },
    );
  }
}
