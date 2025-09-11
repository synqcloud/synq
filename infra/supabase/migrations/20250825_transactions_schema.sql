-- Migration: 20250825_transactions_schema.sql
-- Description: Transactions schema for card shops
-- Tables: user_transaction, user_transaction_items

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM (
            'PENDING',
            'IN_PROGRESS',
            'COMPLETED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM (
            'sale',
            'purchase',
            'grading_submit',
            'refund'
        );
    END IF;
END$$;


-- =============================================
-- Table: user_transaction
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User who owns the transaction log (shop owner)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Status of transaction
    transaction_status transaction_status NOT NULL,

    -- Type of transaction
    transaction_type transaction_type NOT NULL,

    -- Who performed the transaction (employee / owner / system)
    performed_by UUID REFERENCES auth.users(id),

    -- Source (marketplace, in-store, vendor, etc.)
    source TEXT,

    -- Subtotal amount (before taxes and shipping)
    subtotal_amount NUMERIC(10,2),

    -- Tax amount
    tax_amount NUMERIC(10,2) DEFAULT 0,

    -- Shipping cost
    shipping_amount NUMERIC(10,2) DEFAULT 0,

    -- Net amount (subtotal + tax + shipping, positive or negative depending on transaction)
    net_amount NUMERIC(10,2),

    -- Indicates if transaction was created via user integration (webhook, API sync, etc.)
    is_integration BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Table: user_transaction_items
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    transaction_id UUID NOT NULL REFERENCES public.user_transaction(id) ON DELETE CASCADE,

    stock_id UUID NOT NULL REFERENCES public.user_card_stock(id) ON DELETE CASCADE,

    -- Number of cards/items affected
    quantity INTEGER NOT NULL CHECK (quantity >= 0),

    -- Price per unit (sale or purchase)
    unit_price NUMERIC(10, 2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- View: user_transaction_items_with_cards
-- =============================================

CREATE OR REPLACE VIEW public.user_transaction_items_with_cards AS
SELECT
    uti.id AS item_id,
    uti.transaction_id,
    uti.stock_id,
    uti.quantity,
    uti.unit_price,
    ucs.core_card_id,
    cc.name AS card_name,
    cs.name AS set_name,
    cl.name AS game_name,
    ucs.condition,
    ucs.cogs,
    ucs.language,
    ucs.sku,
    ucs.location
FROM public.user_transaction_items uti
JOIN public.user_card_stock ucs ON uti.stock_id = ucs.id
JOIN public.core_cards cc ON ucs.core_card_id = cc.id
JOIN public.core_sets cs ON cc.core_set_id = cs.id
JOIN public.core_libraries cl ON cc.core_library_id = cl.id;


-- =============================================
-- Function: get_user_transactions
-- =============================================

CREATE OR REPLACE FUNCTION public.get_user_transactions(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_statuses transaction_status[] DEFAULT NULL,
    p_types transaction_type[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    transaction_status transaction_status,
    transaction_type transaction_type,
    performed_by UUID,
    source TEXT,
    subtotal_amount NUMERIC(10,2),
    tax_amount NUMERIC(10,2),
    shipping_amount NUMERIC(10,2),
    net_amount NUMERIC(10,2),
    is_integration BOOLEAN,
    created_at TIMESTAMPTZ,
    total_quantity INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.user_id,
        t.transaction_status,
        t.transaction_type,
        t.performed_by,
        t.source,
        t.subtotal_amount,
        t.tax_amount,
        t.shipping_amount,
        t.net_amount,
        t.is_integration,
        t.created_at,
        COALESCE(SUM(uti.quantity)::integer, 0) AS total_quantity
    FROM public.user_transaction t
    LEFT JOIN public.user_transaction_items uti
        ON t.id = uti.transaction_id
    WHERE t.user_id = p_user_id
      AND (p_start_date IS NULL OR t.created_at >= p_start_date)
      AND (p_end_date IS NULL OR t.created_at <= p_end_date)
      AND (p_statuses IS NULL OR t.transaction_status = ANY(p_statuses))
      AND (p_types IS NULL OR t.transaction_type = ANY(p_types))
    GROUP BY
        t.id,
        t.user_id,
        t.transaction_status,
        t.transaction_type,
        t.performed_by,
        t.source,
        t.subtotal_amount,
        t.tax_amount,
        t.shipping_amount,
        t.net_amount,
        t.is_integration,
        t.created_at
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================
-- Function: get_user_marketplaces
-- =============================================

CREATE OR REPLACE FUNCTION public.get_user_marketplaces(
    p_user_id UUID
)
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT DISTINCT source
        FROM public.user_transaction
        WHERE user_id = p_user_id
        AND source IS NOT NULL
        ORDER BY source
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;



-- =============================================
-- Indexes
-- =============================================

-- Primary lookup index: user_id + created_at (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_user_transaction_user_created
ON public.user_transaction (user_id, created_at DESC);

-- Status filtering index: user_id + transaction_status + created_at
CREATE INDEX IF NOT EXISTS idx_user_transaction_user_status_created
ON public.user_transaction (user_id, transaction_status, created_at DESC);

-- Type filtering index: user_id + transaction_type + created_at
CREATE INDEX IF NOT EXISTS idx_user_transaction_user_type_created
ON public.user_transaction (user_id, transaction_type, created_at DESC);

-- Integration filtering index: user_id + is_integration + created_at
CREATE INDEX IF NOT EXISTS idx_user_transaction_user_integration_created
ON public.user_transaction (user_id, is_integration, created_at DESC);

-- Source filtering index (for analytics/reporting)
CREATE INDEX IF NOT EXISTS idx_user_transaction_source
ON public.user_transaction (source) WHERE source IS NOT NULL;

-- Foreign key index for transaction_items (transaction_id is heavily queried)
CREATE INDEX IF NOT EXISTS idx_user_transaction_items_transaction_id
ON public.user_transaction_items (transaction_id);

-- Stock lookup index (for inventory management queries)
CREATE INDEX IF NOT EXISTS idx_user_transaction_items_stock_id
ON public.user_transaction_items (stock_id);

-- Composite index for transaction items with quantity/price analysis
CREATE INDEX IF NOT EXISTS idx_user_transaction_items_transaction_created
ON public.user_transaction_items (transaction_id, created_at DESC);

-- performed_by index (for employee/user activity tracking)
CREATE INDEX IF NOT EXISTS idx_user_transaction_performed_by
ON public.user_transaction (performed_by) WHERE performed_by IS NOT NULL;



-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE public.user_transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_transaction_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: user_transaction
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.user_transaction;
CREATE POLICY "Users can view their own transactions" ON public.user_transaction
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.user_transaction;
CREATE POLICY "Users can insert their own transactions" ON public.user_transaction
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own transactions" ON public.user_transaction;
CREATE POLICY "Users can update their own transactions" ON public.user_transaction
  FOR UPDATE USING (auth.uid() = user_id AND is_integration = FALSE);

-- RLS Policies: user_transaction_items
DROP POLICY IF EXISTS "Users can view their own transaction items" ON public.user_transaction_items;
CREATE POLICY "Users can view their own transaction items" ON public.user_transaction_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.user_transaction t
      WHERE t.id = user_transaction_items.transaction_id
      AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own transaction items" ON public.user_transaction_items;
CREATE POLICY "Users can insert their own transaction items" ON public.user_transaction_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_transaction t
      WHERE t.id = user_transaction_items.transaction_id
      AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own transaction items" ON public.user_transaction_items;
CREATE POLICY "Users can update their own transaction items" ON public.user_transaction_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.user_transaction t
      WHERE t.id = user_transaction_items.transaction_id
      AND t.user_id = auth.uid()
      AND t.is_integration = FALSE
    )
  );

COMMIT;
