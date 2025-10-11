import { ServiceBase } from "./base-service";
import { Database } from "../lib/types/database.types";

type PublicSchema = Database["public"];

// Original dashboard types
export type MonthlyData =
  PublicSchema["Functions"]["get_user_sales_dashboard"]["Returns"][0]["monthly"];
export type TopStockData =
  PublicSchema["Functions"]["get_user_sales_dashboard"]["Returns"][0]["top_stock"];
export type UserDashboardData = {
  monthly: MonthlyData[];
  top_stock: TopStockData[];
};

// New analytics types
export type SetPerformanceData = {
  set_id: string;
  set_name: string;
  set_code: string;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  profit_margin_pct: number;
  units_sold: number;
  unique_cards_sold: number;
  avg_sale_price: number;
  total_inventory_value: number;
  inventory_turn_rate: number;
};

export type CardPerformanceData = {
  stock_id: string;
  card_id: string;
  card_name: string;
  set_name: string;
  rarity: string;
  condition: string;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  profit_margin_pct: number;
  units_sold: number;
  avg_sale_price: number;
  velocity_per_day: number;
  current_inventory: number;
  roi_pct: number;
  first_sale_date: string;
  last_sale_date: string;
};

export type MarketplacePerformanceData = {
  marketplace: string;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  profit_margin_pct: number;
  total_fees: number;
  total_taxes: number;
  total_shipping: number;
  net_revenue: number;
  transaction_count: number;
  units_sold: number;
  avg_transaction_value: number;
  avg_unit_price: number;
  fee_percentage: number;
};

export type SummaryStats = {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  total_units_sold: number;
  total_transactions: number;
  avg_transaction_value: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
};

export type AnalyticsDashboardData = {
  sets_performance: SetPerformanceData[];
  top_cards: CardPerformanceData[];
  marketplace_performance: MarketplacePerformanceData[];
  summary_stats: SummaryStats;
};

/**
 * Service to fetch user dashboard and analytics data
 */
export class DashboardService extends ServiceBase {
  /**
   * Fetch the sales dashboard data for the user (original function)
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

  /**
   * Fetch set performance analytics
   * @param context - server or client
   * @param startDate - start date for analysis (optional)
   * @param endDate - end date for analysis (optional)
   */
  static async fetchSetPerformance(
    context: "server" | "client" = "server",
    startDate?: string,
    endDate?: string,
  ): Promise<SetPerformanceData[]> {
    const userId = await this.getCurrentUserId(context);
    if (!userId) {
      throw new Error(
        "Unable to fetch set performance: no current user found.",
      );
    }

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client.rpc("get_set_performance", {
          p_user_id: userId,
          p_start_date: startDate || null,
          p_end_date: endDate || null,
        });

        if (error)
          throw new Error(
            `RPC error fetching set performance: ${error.message}`,
          );

        return (data || []) as SetPerformanceData[];
      },
      {
        service: "DashboardService",
        method: "fetchSetPerformance",
        userId,
      },
    );
  }

  /**
   * Fetch card performance analytics
   * @param context - server or client
   * @param startDate - start date for analysis (optional)
   * @param endDate - end date for analysis (optional)
   * @param limit - number of cards to return (default: 50)
   */
  static async fetchCardPerformance(
    context: "server" | "client" = "server",
    startDate?: string,
    endDate?: string,
    limit: number = 50,
  ): Promise<CardPerformanceData[]> {
    const userId = await this.getCurrentUserId(context);
    if (!userId) {
      throw new Error(
        "Unable to fetch card performance: no current user found.",
      );
    }

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client.rpc("get_card_performance", {
          p_user_id: userId,
          p_start_date: startDate || null,
          p_end_date: endDate || null,
          p_limit: limit,
        });

        if (error)
          throw new Error(
            `RPC error fetching card performance: ${error.message}`,
          );

        return (data || []) as CardPerformanceData[];
      },
      {
        service: "DashboardService",
        method: "fetchCardPerformance",
        userId,
      },
    );
  }

  /**
   * Fetch marketplace performance analytics
   * @param context - server or client
   * @param startDate - start date for analysis (optional)
   * @param endDate - end date for analysis (optional)
   */
  static async fetchMarketplacePerformance(
    context: "server" | "client" = "server",
    startDate?: string,
    endDate?: string,
  ): Promise<MarketplacePerformanceData[]> {
    const userId = await this.getCurrentUserId(context);
    if (!userId) {
      throw new Error(
        "Unable to fetch marketplace performance: no current user found.",
      );
    }

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client.rpc(
          "get_marketplace_performance",
          {
            p_user_id: userId,
            p_start_date: startDate || null,
            p_end_date: endDate || null,
          },
        );

        if (error)
          throw new Error(
            `RPC error fetching marketplace performance: ${error.message}`,
          );

        return (data || []) as MarketplacePerformanceData[];
      },
      {
        service: "DashboardService",
        method: "fetchMarketplacePerformance",
        userId,
      },
    );
  }

  /**
   * Fetch all analytics dashboard data in one call
   * @param context - server or client
   * @param startDate - start date for analysis (optional)
   * @param endDate - end date for analysis (optional)
   */
  static async fetchAnalyticsDashboard(
    context: "server" | "client" = "server",
    startDate?: string,
    endDate?: string,
  ): Promise<AnalyticsDashboardData> {
    const userId = await this.getCurrentUserId(context);
    if (!userId) {
      throw new Error(
        "Unable to fetch analytics dashboard: no current user found.",
      );
    }

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { data, error } = await client.rpc("get_analytics_dashboard", {
          p_user_id: userId,
          p_start_date: startDate || null,
          p_end_date: endDate || null,
        });

        if (error)
          throw new Error(
            `RPC error fetching analytics dashboard: ${error.message}`,
          );

        const result = data?.[0] ?? {
          sets_performance: [],
          top_cards: [],
          marketplace_performance: [],
          summary_stats: null,
        };

        return {
          sets_performance: (result.sets_performance ||
            []) as SetPerformanceData[],
          top_cards: (result.top_cards || []) as CardPerformanceData[],
          marketplace_performance: (result.marketplace_performance ||
            []) as MarketplacePerformanceData[],
          summary_stats: (result.summary_stats || {
            total_revenue: 0,
            total_cost: 0,
            total_profit: 0,
            total_units_sold: 0,
            total_transactions: 0,
            avg_transaction_value: 0,
            date_range: { start_date: "", end_date: "" },
          }) as SummaryStats,
        };
      },
      {
        service: "DashboardService",
        method: "fetchAnalyticsDashboard",
        userId,
      },
    );
  }
}
