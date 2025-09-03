-- Migration: 20250825_orders_schema.sql
-- Description: Orders schema for card shops
-- Tables: user_orders, user_order_items

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM (
            'PENDING',
            'IN_PROGRESS',
            'COMPLETED'
        );
    END IF;
END$$;


-- =============================================
-- Table: user_orders
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User who owns the order log (shop owner)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Status of order
    order_status order_status NOT NULL,

    -- Who performed the order (employee / owner / system)
    performed_by UUID REFERENCES auth.users(id),

    -- Source (marketplace, in-store, vendor, etc.)
    source TEXT,

    -- Net amount (positive or negative depending on order)
    net_amount NUMERIC(10,2),

    -- Indicates if order was created via user integration (webhook, API sync, etc.)
    is_integration BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Table: user_order_items
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL REFERENCES public.user_orders(id) ON DELETE CASCADE,

    stock_id UUID NOT NULL REFERENCES public.user_card_stock(id) ON DELETE CASCADE,

    -- Number of cards/items affected
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    -- Price per unit (sale or purchase)
    unit_price NUMERIC(10, 2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- View: user_order_items_with_cards
-- =============================================

CREATE OR REPLACE VIEW public.user_order_items_with_cards AS
SELECT
    uoi.id AS item_id,
    uoi.order_id,
    uoi.stock_id,
    uoi.quantity,
    uoi.unit_price,
    ucs.core_card_id,
    cc.name AS card_name,
    cs.name AS set_name,
    cl.name AS game_name,
    ucs.condition,
    ucs.grading,
    ucs.language,
    ucs.sku,
    ucs.location
FROM public.user_order_items uoi
JOIN public.user_card_stock ucs ON uoi.stock_id = ucs.id
JOIN public.core_cards cc ON ucs.core_card_id = cc.id
JOIN public.core_sets cs ON cc.core_set_id = cs.id
JOIN public.core_libraries cl ON cc.core_library_id = cl.id;


-- =============================================
-- Function: get_user_orders
-- =============================================

CREATE OR REPLACE FUNCTION public.get_user_orders(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_statuses order_status[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    order_status order_status,
    performed_by UUID,
    source TEXT,
    net_amount NUMERIC(10,2),
    is_integration BOOLEAN,
    created_at TIMESTAMPTZ,
    total_quantity INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.user_id,
        o.order_status,
        o.performed_by,
        o.source,
        o.net_amount,
        o.is_integration,
        o.created_at,
        COALESCE(SUM(uoi.quantity)::integer, 0) AS total_quantity
    FROM public.user_orders o
    LEFT JOIN public.user_order_items uoi
        ON o.id = uoi.order_id
    WHERE o.user_id = p_user_id
      AND (p_start_date IS NULL OR o.created_at >= p_start_date)
      AND (p_end_date IS NULL OR o.created_at <= p_end_date)
      AND (p_statuses IS NULL OR o.order_status = ANY(p_statuses))
    GROUP BY
        o.id,
        o.user_id,
        o.order_status,
        o.performed_by,
        o.source,
        o.net_amount,
        o.is_integration,
        o.created_at
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;



-- =============================================
-- Indexes
-- =============================================

-- Primary lookup index: user_id + created_at (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_user_orders_user_created
ON public.user_orders (user_id, created_at DESC);

-- Status filtering index: user_id + order_status + created_at
CREATE INDEX IF NOT EXISTS idx_user_orders_user_status_created
ON public.user_orders (user_id, order_status, created_at DESC);

-- Integration filtering index: user_id + is_integration + created_at
CREATE INDEX IF NOT EXISTS idx_user_orders_user_integration_created
ON public.user_orders (user_id, is_integration, created_at DESC);

-- Source filtering index (for analytics/reporting)
CREATE INDEX IF NOT EXISTS idx_user_orders_source
ON public.user_orders (source) WHERE source IS NOT NULL;

-- Foreign key index for order_items (order_id is heavily queried)
CREATE INDEX IF NOT EXISTS idx_user_order_items_order_id
ON public.user_order_items (order_id);

-- Stock lookup index (for inventory management queries)
CREATE INDEX IF NOT EXISTS idx_user_order_items_stock_id
ON public.user_order_items (stock_id);

-- Composite index for order items with quantity/price analysis
CREATE INDEX IF NOT EXISTS idx_user_order_items_order_created
ON public.user_order_items (order_id, created_at DESC);

-- performed_by index (for employee/user activity tracking)
CREATE INDEX IF NOT EXISTS idx_user_orders_performed_by
ON public.user_orders (performed_by) WHERE performed_by IS NOT NULL;



-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE public.user_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: user_orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.user_orders;
CREATE POLICY "Users can view their own orders" ON public.user_orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.user_orders;
CREATE POLICY "Users can insert their own orders" ON public.user_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own orders" ON public.user_orders;
CREATE POLICY "Users can update their own orders" ON public.user_orders
  FOR UPDATE USING (auth.uid() = user_id AND is_integration = FALSE);

-- RLS Policies: user_order_items
DROP POLICY IF EXISTS "Users can view their own order items" ON public.user_order_items;
CREATE POLICY "Users can view their own order items" ON public.user_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.user_orders o
      WHERE o.id = user_order_items.order_id
      AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own order items" ON public.user_order_items;
CREATE POLICY "Users can insert their own order items" ON public.user_order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_orders o
      WHERE o.id = user_order_items.order_id
      AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own order items" ON public.user_order_items;
CREATE POLICY "Users can update their own order items" ON public.user_order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.user_orders o
      WHERE o.id = user_order_items.order_id
      AND o.user_id = auth.uid()
      AND o.is_integration = FALSE
    )
  );

COMMIT;
