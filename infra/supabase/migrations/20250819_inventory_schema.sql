-- Migration: 20250819_inventory_schema.sql
-- Description: Inventory schema for card shops (without grading column)
-- Tables: user_card_stock, marketplaces, user_stock_listings

-- =============================================
-- User Stock
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_card_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    core_card_id UUID NOT NULL REFERENCES public.core_cards(id) ON DELETE CASCADE,

    -- Stock details
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    condition VARCHAR(50), -- No default, nullable

    -- Financial tracking
    cogs DECIMAL(10,2), -- Cost of Goods Sold

    -- Organization
    sku VARCHAR(100),
    location VARCHAR(200),
    language VARCHAR(50) NOT NULL DEFAULT 'en',


    -- Soft delete for when user removes library access but wants to keep transaction history
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.get_user_sets_with_stock(
    p_user_id UUID,
    p_library_id UUID,
    p_offset INT DEFAULT 0,
    p_limit INT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    stock INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        CASE
            WHEN COUNT(ucs.id) = 0 THEN NULL
            ELSE SUM(ucs.quantity)::INT  -- cast bigint -> int
        END AS stock
    FROM public.core_sets s
    LEFT JOIN public.core_cards c ON c.core_set_id = s.id
    LEFT JOIN public.user_card_stock ucs
        ON ucs.core_card_id = c.id
        AND ucs.user_id = p_user_id
    WHERE s.core_library_id = p_library_id
    GROUP BY s.id, s.name
    ORDER BY s.name ASC
    OFFSET p_offset
    LIMIT COALESCE(p_limit, NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_cards_with_stock(
    p_user_id UUID,
    p_set_id UUID,
    p_offset INT DEFAULT 0,
    p_limit INT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    tcgplayer_id TEXT,
    stock INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.tcgplayer_id,
        CASE
            WHEN COUNT(ucs.id) = 0 THEN NULL
            ELSE SUM(ucs.quantity)::INT
        END AS stock
    FROM public.core_cards c
    LEFT JOIN public.user_card_stock ucs
        ON ucs.core_card_id = c.id
        AND ucs.user_id = p_user_id
    WHERE c.core_set_id = p_set_id
    GROUP BY c.id, c.name, c.tcgplayer_id
    ORDER BY c.name ASC
    OFFSET p_offset
    LIMIT COALESCE(p_limit, NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_libraries_with_stock(
    p_user_id UUID,
    p_library_ids UUID[],
    p_offset INT DEFAULT 0,
    p_limit INT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    stock INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.name,
        CASE
            WHEN COUNT(ucs.id) = 0 THEN NULL
            ELSE SUM(ucs.quantity)::INT
        END AS stock
    FROM public.core_libraries l
    LEFT JOIN public.core_sets s ON s.core_library_id = l.id
    LEFT JOIN public.core_cards c ON c.core_set_id = s.id
    LEFT JOIN public.user_card_stock ucs
        ON ucs.core_card_id = c.id
        AND ucs.user_id = p_user_id
    WHERE l.id = ANY(p_library_ids)
    GROUP BY l.id, l.name
    ORDER BY l.name ASC
    OFFSET p_offset
    LIMIT COALESCE(p_limit, NULL);
END;
$$;


-- =============================================
-- Table: marketplaces
-- =============================================
CREATE TABLE IF NOT EXISTS public.marketplaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: user_stock_listings
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_stock_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    stock_id UUID NOT NULL REFERENCES public.user_card_stock(id) ON DELETE CASCADE,
    marketplace_id UUID NOT NULL REFERENCES public.marketplaces(id),

    external_id VARCHAR(200),

    listed_price DECIMAL(10,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(stock_id, marketplace_id)
);

-- =============================================
-- Function: get_card_stock
-- =============================================
-- Ensure compatibility when function exists on target (cannot change return type with CREATE OR REPLACE)
DO $$
BEGIN
  IF to_regprocedure('public.get_card_stock(uuid, uuid)') IS NOT NULL THEN
    EXECUTE 'DROP FUNCTION public.get_card_stock(uuid, uuid)';
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.get_card_stock(
    p_user_id UUID,
    p_core_card_id UUID DEFAULT NULL
)
RETURNS TABLE(
    stock_id UUID,
    core_card_id UUID,
    card_name TEXT,
    set_name TEXT,
    library_name TEXT,
    quantity INTEGER,
    condition TEXT,
    language TEXT,
    cogs NUMERIC,
    location TEXT,
    marketplaces TEXT[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ucs.id AS stock_id,
        ucs.core_card_id,
        cc.name::TEXT AS card_name,
        cs.name::TEXT AS set_name,
        cl.name::TEXT AS library_name,
        ucs.quantity,
        ucs.condition::TEXT AS condition,
        ucs.language::TEXT AS language,
        -- Handle cogs array if it exists; take first element or sum, depending on your logic
        -- Option 1: If cogs is a single number stored as string
        ucs.cogs::NUMERIC AS cogs
        -- Option 2: If cogs is a VARCHAR[] and you want sum as NUMERIC
        -- (SELECT SUM(x::NUMERIC) FROM unnest(ucs.cogs) AS x) AS cogs
        ,
        ucs.location::TEXT AS location,
        (
          SELECT COALESCE(array_agg(DISTINCT m.name::text), '{}'::text[])
          FROM public.user_stock_listings usl
          JOIN public.marketplaces m ON m.id = usl.marketplace_id
          WHERE usl.stock_id = ucs.id
        ) AS marketplaces
    FROM public.user_card_stock ucs
    JOIN public.core_cards cc ON ucs.core_card_id = cc.id
    JOIN public.core_sets cs ON cc.core_set_id = cs.id
    JOIN public.core_libraries cl ON cc.core_library_id = cl.id
    WHERE ucs.user_id = p_user_id
      AND ucs.is_active = TRUE
      AND (p_core_card_id IS NULL OR ucs.core_card_id = p_core_card_id)
    ORDER BY cc.name, ucs.condition, ucs.language;
END;
$$;



-- =============================================
-- Indexes for Performance
-- =============================================

-- Indexes for user_card_stock
CREATE INDEX IF NOT EXISTS idx_user_card_stock_user_id
ON public.user_card_stock(user_id);

CREATE INDEX IF NOT EXISTS idx_user_card_stock_core_card_id
ON public.user_card_stock(core_card_id);

CREATE INDEX IF NOT EXISTS idx_user_card_stock_active
ON public.user_card_stock(is_active) WHERE is_active = true;

-- Indexes for user_stock_listings
CREATE INDEX IF NOT EXISTS idx_user_stock_listings_stock_id
ON public.user_stock_listings(stock_id);

CREATE INDEX IF NOT EXISTS idx_user_stock_listings_marketplace_id
ON public.user_stock_listings(marketplace_id);

-- Indexes for marketplaces
CREATE INDEX IF NOT EXISTS idx_marketplaces_name
ON public.marketplaces(name);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS for user_card_stock
ALTER TABLE public.user_card_stock ENABLE ROW LEVEL SECURITY;

-- RLS Policies: User stock access
DROP POLICY IF EXISTS "Users can view their own stock" ON public.user_card_stock;
CREATE POLICY "Users can view their own stock" ON public.user_card_stock FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create stock" ON public.user_card_stock;
CREATE POLICY "Users can create stock" ON public.user_card_stock FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stock" ON public.user_card_stock;
CREATE POLICY "Users can update their own stock" ON public.user_card_stock FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own stock" ON public.user_card_stock;
CREATE POLICY "Users can delete their own stock" ON public.user_card_stock FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS for user_stock_listings
ALTER TABLE public.user_stock_listings ENABLE ROW LEVEL SECURITY;

-- Users can view their own listings
DROP POLICY IF EXISTS "Users can view their own listings" ON public.user_stock_listings;
CREATE POLICY "Users can view their own listings"
ON public.user_stock_listings
FOR SELECT
USING (
    stock_id IN (SELECT id FROM public.user_card_stock WHERE user_id = auth.uid())
);

-- Users can create listings only for their own stock
DROP POLICY IF EXISTS "Users can create listings" ON public.user_stock_listings;
CREATE POLICY "Users can create listings"
ON public.user_stock_listings
FOR INSERT
WITH CHECK (
    stock_id IN (SELECT id FROM public.user_card_stock WHERE user_id = auth.uid())
);

-- Users can update their own listings
DROP POLICY IF EXISTS "Users can update their own listings" ON public.user_stock_listings;
CREATE POLICY "Users can update their own listings"
ON public.user_stock_listings
FOR UPDATE
USING (
    stock_id IN (SELECT id FROM public.user_card_stock WHERE user_id = auth.uid())
);

-- Users can delete their own listings
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.user_stock_listings;
CREATE POLICY "Users can delete their own listings"
ON public.user_stock_listings
FOR DELETE
USING (
    stock_id IN (SELECT id FROM public.user_card_stock WHERE user_id = auth.uid())
);

-- Enable RLS for marketplaces (public read access)
ALTER TABLE public.marketplaces ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read marketplaces
DROP POLICY IF EXISTS "Public read access to marketplaces" ON public.marketplaces;
CREATE POLICY "Public read access to marketplaces"
ON public.marketplaces
FOR SELECT
USING (auth.role() = 'authenticated');
