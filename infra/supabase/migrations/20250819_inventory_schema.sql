-- Migration: 20250819_inventory_schema_no_grading.sql
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

-- Uniqueness constraint for condition + language
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_stock_unique_condition
ON public.user_card_stock(user_id, core_card_id, condition, language)
WHERE condition IS NOT NULL;

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
CREATE OR REPLACE FUNCTION public.get_card_stock(p_core_card_id UUID)
RETURNS TABLE(
    stock_id UUID,
    quantity INTEGER,
    condition VARCHAR,
    cogs DECIMAL,
    sku VARCHAR,
    location VARCHAR,
    language VARCHAR,
    updated_at TIMESTAMPTZ,
    marketplaces TEXT[],
    marketplace_prices JSONB
)
LANGUAGE sql
AS $$
    SELECT
        ucs.id AS stock_id,
        ucs.quantity,
        ucs.condition,
        ucs.cogs,
        ucs.sku,
        ucs.location,
        ucs.language,
        ucs.updated_at,
        COALESCE(
            ARRAY_AGG(DISTINCT m.name) FILTER (WHERE m.name IS NOT NULL),
            '{}'
        ) AS marketplaces,
        COALESCE(
            JSONB_OBJECT_AGG(
                m.name,
                usl.listed_price
            ) FILTER (WHERE m.name IS NOT NULL),
            '{}'::jsonb
        ) AS marketplace_prices
    FROM public.user_card_stock ucs
    LEFT JOIN public.user_stock_listings usl
        ON usl.stock_id = ucs.id
    LEFT JOIN public.marketplaces m
        ON m.id = usl.marketplace_id
    WHERE ucs.core_card_id = p_core_card_id
      AND ucs.is_active = true
      AND ucs.user_id = auth.uid()
    GROUP BY ucs.id, ucs.quantity, ucs.condition, ucs.cogs, ucs.sku, ucs.location, ucs.language, ucs.updated_at
    ORDER BY ucs.created_at DESC;
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
