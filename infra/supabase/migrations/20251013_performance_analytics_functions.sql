-- =============================================
-- Migration: Analytics Functions for Dashboard (Complete Fix)
-- Description: Performance tracking for sets, cards, and marketplaces
-- =============================================

BEGIN;

-- Drop existing functions first to ensure clean slate
DROP FUNCTION IF EXISTS public.get_analytics_dashboard(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS public.get_marketplace_performance(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS public.get_card_performance(UUID, DATE, DATE, INTEGER);
DROP FUNCTION IF EXISTS public.get_set_performance(UUID, DATE, DATE);

-- =============================================
-- Function 1: Set Performance Analytics
-- =============================================
CREATE FUNCTION public.get_set_performance(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    set_id UUID,
    set_name VARCHAR(200),
    set_code VARCHAR(200),
    total_revenue NUMERIC,
    total_cost NUMERIC,
    total_profit NUMERIC,
    profit_margin_pct NUMERIC,
    units_sold INTEGER,
    unique_cards_sold INTEGER,
    avg_sale_price NUMERIC,
    total_inventory_value NUMERIC,
    inventory_turn_rate NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Default date range: last 6 months
    IF p_start_date IS NULL THEN
        p_start_date := CURRENT_DATE - INTERVAL '6 months';
    END IF;

    IF p_end_date IS NULL THEN
        p_end_date := CURRENT_DATE;
    END IF;

    RETURN QUERY
    WITH sales_data AS (
        SELECT
            cs.id AS set_id,
            cs.name AS set_name,
            cs.slug AS set_code,
            SUM(uti.quantity * uti.unit_price) AS revenue,
            SUM(uti.quantity * COALESCE(ucs.cogs, 0)) AS cost,
            SUM(uti.quantity) AS units_sold,
            COUNT(DISTINCT cc.id) AS unique_cards,
            AVG(uti.unit_price) AS avg_price
        FROM user_transaction t
        INNER JOIN user_transaction_items uti ON t.id = uti.transaction_id
        INNER JOIN user_card_stock ucs ON uti.stock_id = ucs.id
        INNER JOIN core_cards cc ON ucs.core_card_id = cc.id
        INNER JOIN core_sets cs ON cc.core_set_id = cs.id
        WHERE t.user_id = p_user_id
          AND t.transaction_type = 'sale'
          AND t.transaction_status = 'COMPLETED'
          AND t.created_at >= p_start_date
          AND t.created_at <= p_end_date
        GROUP BY cs.id, cs.name, cs.slug
    ),
    inventory_data AS (
        SELECT
            cs.id AS set_id,
            SUM(ucs.quantity * COALESCE(ucs.cogs, 0)) AS inventory_value
        FROM user_card_stock ucs
        INNER JOIN core_cards cc ON ucs.core_card_id = cc.id
        INNER JOIN core_sets cs ON cc.core_set_id = cs.id
        WHERE ucs.user_id = p_user_id
          AND ucs.is_active = true
          AND ucs.quantity > 0
        GROUP BY cs.id
    )
    SELECT
        sd.set_id,
        sd.set_name,
        sd.set_code,
        COALESCE(sd.revenue, 0)::NUMERIC(10,2) AS total_revenue,
        COALESCE(sd.cost, 0)::NUMERIC(10,2) AS total_cost,
        COALESCE(sd.revenue - sd.cost, 0)::NUMERIC(10,2) AS total_profit,
        CASE
            WHEN sd.revenue > 0 THEN
                ROUND(((sd.revenue - sd.cost) / sd.revenue * 100)::NUMERIC, 2)
            ELSE 0
        END AS profit_margin_pct,
        COALESCE(sd.units_sold, 0)::INTEGER AS units_sold,
        COALESCE(sd.unique_cards, 0)::INTEGER AS unique_cards_sold,
        COALESCE(sd.avg_price, 0)::NUMERIC(10,2) AS avg_sale_price,
        COALESCE(id.inventory_value, 0)::NUMERIC(10,2) AS total_inventory_value,
        CASE
            WHEN COALESCE(id.inventory_value, 0) > 0 THEN
                ROUND((sd.revenue / id.inventory_value)::NUMERIC, 2)
            ELSE 0
        END AS inventory_turn_rate
    FROM sales_data sd
    LEFT JOIN inventory_data id ON sd.set_id = id.set_id
    ORDER BY sd.revenue DESC;
END;
$$;

-- =============================================
-- Function 2: Card Performance Analytics
-- =============================================
CREATE FUNCTION public.get_card_performance(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    stock_id UUID,
    card_id UUID,
    card_name VARCHAR(300),
    set_name VARCHAR(200),
    rarity VARCHAR(100),
    condition VARCHAR(50),
    total_revenue NUMERIC,
    total_cost NUMERIC,
    total_profit NUMERIC,
    profit_margin_pct NUMERIC,
    units_sold INTEGER,
    avg_sale_price NUMERIC,
    velocity_per_day NUMERIC,
    current_inventory INTEGER,
    roi_pct NUMERIC,
    first_sale_date TIMESTAMP WITH TIME ZONE,
    last_sale_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Default date range: last 6 months
    IF p_start_date IS NULL THEN
        p_start_date := CURRENT_DATE - INTERVAL '6 months';
    END IF;

    IF p_end_date IS NULL THEN
        p_end_date := CURRENT_DATE;
    END IF;

    RETURN QUERY
    WITH sales_aggregated AS (
        SELECT
            ucs.id AS stock_id,
            cc.id AS card_id,
            cc.name AS card_name,
            cs.name AS set_name,
            cc.rarity,
            ucs.condition,
            SUM(uti.quantity * uti.unit_price) AS revenue,
            SUM(uti.quantity * COALESCE(ucs.cogs, 0)) AS cost,
            SUM(uti.quantity) AS units_sold,
            AVG(uti.unit_price) AS avg_price,
            MIN(t.created_at) AS first_sale,
            MAX(t.created_at) AS last_sale,
            ucs.quantity AS current_qty
        FROM user_transaction t
        INNER JOIN user_transaction_items uti ON t.id = uti.transaction_id
        INNER JOIN user_card_stock ucs ON uti.stock_id = ucs.id
        INNER JOIN core_cards cc ON ucs.core_card_id = cc.id
        INNER JOIN core_sets cs ON cc.core_set_id = cs.id
        WHERE t.user_id = p_user_id
          AND t.transaction_type = 'sale'
          AND t.transaction_status = 'COMPLETED'
          AND t.created_at >= p_start_date
          AND t.created_at <= p_end_date
        GROUP BY ucs.id, cc.id, cc.name, cs.name, cc.rarity, ucs.condition, ucs.quantity
    )
    SELECT
        sa.stock_id,
        sa.card_id,
        sa.card_name,
        sa.set_name,
        COALESCE(sa.rarity, 'Unknown')::VARCHAR(100),
        COALESCE(sa.condition, 'NM')::VARCHAR(50),
        COALESCE(sa.revenue, 0)::NUMERIC(10,2) AS total_revenue,
        COALESCE(sa.cost, 0)::NUMERIC(10,2) AS total_cost,
        COALESCE(sa.revenue - sa.cost, 0)::NUMERIC(10,2) AS total_profit,
        CASE
            WHEN sa.revenue > 0 THEN
                ROUND(((sa.revenue - sa.cost) / sa.revenue * 100)::NUMERIC, 2)
            ELSE 0
        END AS profit_margin_pct,
        COALESCE(sa.units_sold, 0)::INTEGER AS units_sold,
        COALESCE(sa.avg_price, 0)::NUMERIC(10,2) AS avg_sale_price,
        CASE
            WHEN sa.first_sale IS NOT NULL THEN
                ROUND(
                    (sa.units_sold::NUMERIC /
                    GREATEST(EXTRACT(DAY FROM (COALESCE(sa.last_sale, CURRENT_TIMESTAMP) - sa.first_sale)) + 1, 1)),
                    2
                )
            ELSE 0
        END AS velocity_per_day,
        COALESCE(sa.current_qty, 0)::INTEGER AS current_inventory,
        CASE
            WHEN sa.cost > 0 THEN
                ROUND((((sa.revenue - sa.cost) / sa.cost) * 100)::NUMERIC, 2)
            ELSE 0
        END AS roi_pct,
        sa.first_sale AS first_sale_date,
        sa.last_sale AS last_sale_date
    FROM sales_aggregated sa
    ORDER BY sa.revenue DESC
    LIMIT p_limit;
END;
$$;

-- =============================================
-- Function 3: Marketplace Performance Analytics
-- =============================================
CREATE FUNCTION public.get_marketplace_performance(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    marketplace TEXT,
    total_revenue NUMERIC,
    total_cost NUMERIC,
    total_profit NUMERIC,
    profit_margin_pct NUMERIC,
    total_fees NUMERIC,
    total_taxes NUMERIC,
    total_shipping NUMERIC,
    net_revenue NUMERIC,
    transaction_count INTEGER,
    units_sold INTEGER,
    avg_transaction_value NUMERIC,
    avg_unit_price NUMERIC,
    fee_percentage NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Default date range: last 6 months
    IF p_start_date IS NULL THEN
        p_start_date := CURRENT_DATE - INTERVAL '6 months';
    END IF;

    IF p_end_date IS NULL THEN
        p_end_date := CURRENT_DATE;
    END IF;

    RETURN QUERY
    WITH marketplace_sales AS (
        SELECT
            COALESCE(t.source, 'Direct')::TEXT AS marketplace,
            SUM(uti.quantity * uti.unit_price) AS revenue,
            SUM(uti.quantity * COALESCE(ucs.cogs, 0)) AS cost,
            SUM(COALESCE(t.tax_amount, 0)) AS taxes,
            SUM(COALESCE(t.shipping_amount, 0)) AS shipping,
            SUM(COALESCE(t.subtotal_amount, 0) - COALESCE(t.net_amount, 0)) AS fees,
            SUM(COALESCE(t.net_amount, 0)) AS net_amount,
            COUNT(DISTINCT t.id) AS transaction_cnt,
            SUM(uti.quantity) AS units
        FROM user_transaction t
        INNER JOIN user_transaction_items uti ON t.id = uti.transaction_id
        INNER JOIN user_card_stock ucs ON uti.stock_id = ucs.id
        WHERE t.user_id = p_user_id
          AND t.transaction_type = 'sale'
          AND t.transaction_status = 'COMPLETED'
          AND t.created_at >= p_start_date
          AND t.created_at <= p_end_date
        GROUP BY COALESCE(t.source, 'Direct')::TEXT
    )
    SELECT
        ms.marketplace,
        COALESCE(ms.revenue, 0)::NUMERIC(10,2) AS total_revenue,
        COALESCE(ms.cost, 0)::NUMERIC(10,2) AS total_cost,
        COALESCE(ms.revenue - ms.cost, 0)::NUMERIC(10,2) AS total_profit,
        CASE
            WHEN ms.revenue > 0 THEN
                ROUND(((ms.revenue - ms.cost) / ms.revenue * 100)::NUMERIC, 2)
            ELSE 0
        END AS profit_margin_pct,
        COALESCE(ms.fees, 0)::NUMERIC(10,2) AS total_fees,
        COALESCE(ms.taxes, 0)::NUMERIC(10,2) AS total_taxes,
        COALESCE(ms.shipping, 0)::NUMERIC(10,2) AS total_shipping,
        COALESCE(ms.net_amount, 0)::NUMERIC(10,2) AS net_revenue,
        COALESCE(ms.transaction_cnt, 0)::INTEGER AS transaction_count,
        COALESCE(ms.units, 0)::INTEGER AS units_sold,
        CASE
            WHEN ms.transaction_cnt > 0 THEN
                ROUND((ms.revenue / ms.transaction_cnt)::NUMERIC, 2)
            ELSE 0
        END AS avg_transaction_value,
        CASE
            WHEN ms.units > 0 THEN
                ROUND((ms.revenue / ms.units)::NUMERIC, 2)
            ELSE 0
        END AS avg_unit_price,
        CASE
            WHEN ms.revenue > 0 THEN
                ROUND((ms.fees / ms.revenue * 100)::NUMERIC, 2)
            ELSE 0
        END AS fee_percentage
    FROM marketplace_sales ms
    ORDER BY ms.revenue DESC;
END;
$$;

-- =============================================
-- Function 4: Combined Dashboard Data
-- =============================================
CREATE FUNCTION public.get_analytics_dashboard(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    sets_performance JSON,
    top_cards JSON,
    marketplace_performance JSON,
    summary_stats JSON
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    -- Default date range
    v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '6 months');
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);

    -- Sets Performance
    sets_performance := (
        SELECT json_agg(row_to_json(sp))
        FROM get_set_performance(p_user_id, v_start_date, v_end_date) sp
    );

    -- Top Cards Performance (limit to 20)
    top_cards := (
        SELECT json_agg(row_to_json(cp))
        FROM get_card_performance(p_user_id, v_start_date, v_end_date, 20) cp
    );

    -- Marketplace Performance
    marketplace_performance := (
        SELECT json_agg(row_to_json(mp))
        FROM get_marketplace_performance(p_user_id, v_start_date, v_end_date) mp
    );

    -- Summary Statistics
    summary_stats := (
        SELECT json_build_object(
            'total_revenue', COALESCE(SUM(uti.quantity * uti.unit_price), 0),
            'total_cost', COALESCE(SUM(uti.quantity * COALESCE(ucs.cogs, 0)), 0),
            'total_profit', COALESCE(SUM(uti.quantity * uti.unit_price) - SUM(uti.quantity * COALESCE(ucs.cogs, 0)), 0),
            'total_units_sold', COALESCE(SUM(uti.quantity), 0),
            'total_transactions', COUNT(DISTINCT t.id),
            'avg_transaction_value', ROUND(COALESCE(AVG(t.net_amount), 0), 2),
            'date_range', json_build_object(
                'start_date', v_start_date,
                'end_date', v_end_date
            )
        )
        FROM user_transaction t
        INNER JOIN user_transaction_items uti ON t.id = uti.transaction_id
        INNER JOIN user_card_stock ucs ON uti.stock_id = ucs.id
        WHERE t.user_id = p_user_id
          AND t.transaction_type = 'sale'
          AND t.transaction_status = 'COMPLETED'
          AND t.created_at >= v_start_date
          AND t.created_at <= v_end_date
    );

    RETURN NEXT;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_set_performance(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_card_performance(UUID, DATE, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_marketplace_performance(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_dashboard(UUID, DATE, DATE) TO authenticated;

COMMIT;
