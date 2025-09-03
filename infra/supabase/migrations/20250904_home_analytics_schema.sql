-- =============================================
-- Migration: 20250903_sales_dashboard_analytics_alltime_top.sql
-- Description: Top performers all-time by total sold, per_day included
-- =============================================
BEGIN;

CREATE OR REPLACE FUNCTION public.get_user_sales_dashboard(
    p_user_id UUID,
    p_months INT DEFAULT 5
)
RETURNS TABLE (
    monthly JSON,
    top_stock JSON
) AS $$
DECLARE
    start_date DATE := date_trunc('month', current_date) - INTERVAL '1 month' * (p_months - 1);
BEGIN
    -- Monthly revenue & profit (last N months)
    -- Note: Assuming SALE orders have positive net_amount
    monthly := (
        SELECT json_agg(row_to_json(t))
        FROM (
            SELECT
                to_char(date_trunc('month', o.created_at), 'Mon') AS month,
                COALESCE(SUM(CASE WHEN o.net_amount > 0 THEN uoi.quantity * uoi.unit_price END), 0) AS revenue,
                COALESCE(SUM(CASE WHEN o.net_amount > 0 THEN uoi.quantity * COALESCE(ucs.cogs, 0) END), 0) AS cost,
                COALESCE(SUM(CASE WHEN o.net_amount > 0 THEN uoi.quantity * uoi.unit_price END), 0) -
                COALESCE(SUM(CASE WHEN o.net_amount > 0 THEN uoi.quantity * COALESCE(ucs.cogs, 0) END), 0) AS profit
            FROM public.user_orders o
            LEFT JOIN public.user_order_items uoi
                ON o.id = uoi.order_id
            LEFT JOIN public.user_card_stock ucs
                ON uoi.stock_id = ucs.id
            WHERE o.user_id = p_user_id
              AND o.created_at >= start_date
            GROUP BY date_trunc('month', o.created_at)
            ORDER BY date_trunc('month', o.created_at)
        ) t
    );

    -- Top performing stock (all-time by total sold)
    -- Note: Assuming sales orders have positive net_amount
    top_stock := (
        SELECT json_agg(row_to_json(c))
        FROM (
            SELECT
                ucs.id AS stock_id,
                ucs.core_card_id,
                cc.name AS card_name,
                SUM(uoi.quantity) AS sold_count,
                SUM(uoi.quantity * uoi.unit_price) AS revenue,
                CASE
                    WHEN SUM(uoi.quantity * uoi.unit_price) = 0 THEN 0
                    ELSE ROUND(
                        (SUM(uoi.quantity * uoi.unit_price) - SUM(COALESCE(ucs.cogs, 0) * uoi.quantity))::numeric
                        / SUM(uoi.quantity * uoi.unit_price) * 100, 2
                    )
                END AS margin_pct,
                ROUND(
                    SUM(uoi.quantity) / GREATEST(EXTRACT(DAY FROM (current_date - MIN(o.created_at))) + 1, 1),
                    1
                ) AS per_day
            FROM public.user_order_items uoi
            JOIN public.user_orders o
                ON uoi.order_id = o.id
            JOIN public.user_card_stock ucs
                ON uoi.stock_id = ucs.id
            JOIN public.core_cards cc
                ON ucs.core_card_id = cc.id
            WHERE o.user_id = p_user_id
              AND o.net_amount > 0  -- Assuming positive net_amount indicates sales
            GROUP BY ucs.id, ucs.core_card_id, cc.name
            ORDER BY sold_count DESC, per_day DESC
            LIMIT 10
        ) c
    );

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMIT;
