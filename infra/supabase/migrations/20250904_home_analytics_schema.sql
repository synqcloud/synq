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
    -- Note: Assuming SALE transactions have positive net_amount
    monthly := (
        SELECT json_agg(row_to_json(t))
        FROM (
            SELECT
                to_char(date_trunc('month', t.created_at), 'Mon') AS month,
                COALESCE(SUM(CASE WHEN t.net_amount > 0 THEN uti.quantity * uti.unit_price END), 0) AS revenue,
                COALESCE(SUM(CASE WHEN t.net_amount > 0 THEN uti.quantity * COALESCE(ucs.cogs, 0) END), 0) AS cost,
                COALESCE(SUM(CASE WHEN t.net_amount > 0 THEN uti.quantity * uti.unit_price END), 0) -
                COALESCE(SUM(CASE WHEN t.net_amount > 0 THEN uti.quantity * COALESCE(ucs.cogs, 0) END), 0) AS profit
            FROM public.user_transaction t
            LEFT JOIN public.user_transaction_items uti
                ON t.id = uti.transaction_id
            LEFT JOIN public.user_card_stock ucs
                ON uti.stock_id = ucs.id
            WHERE t.user_id = p_user_id
              AND t.created_at >= start_date
            GROUP BY date_trunc('month', t.created_at)
            ORDER BY date_trunc('month', t.created_at)
        ) t
    );

    -- Top performing stock (all-time by total sold)
    -- Note: Assuming sales transactions have positive net_amount
    top_stock := (
        SELECT json_agg(row_to_json(c))
        FROM (
            SELECT
                ucs.id AS stock_id,
                ucs.core_card_id,
                cc.name AS card_name,
                SUM(uti.quantity) AS sold_count,
                SUM(uti.quantity * uti.unit_price) AS revenue,
                CASE
                    WHEN SUM(uti.quantity * uti.unit_price) = 0 THEN 0
                    ELSE ROUND(
                        (SUM(uti.quantity * uti.unit_price) - SUM(COALESCE(ucs.cogs, 0) * uti.quantity))::numeric
                        / SUM(uti.quantity * uti.unit_price) * 100, 2
                    )
                END AS margin_pct,
                ROUND(
                    SUM(uti.quantity) / GREATEST(EXTRACT(DAY FROM (current_date - MIN(t.created_at))) + 1, 1),
                    1
                ) AS per_day
            FROM public.user_transaction_items uti
            JOIN public.user_transaction t
                ON uti.transaction_id = t.id
            JOIN public.user_card_stock ucs
                ON uti.stock_id = ucs.id
            JOIN public.core_cards cc
                ON ucs.core_card_id = cc.id
            WHERE t.user_id = p_user_id
              AND t.net_amount > 0  -- Assuming positive net_amount indicates sales
            GROUP BY ucs.id, ucs.core_card_id, cc.name
            ORDER BY sold_count DESC, per_day DESC
            LIMIT 10
        ) c
    );

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMIT;
