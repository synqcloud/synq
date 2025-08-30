-- Migration: 20250811_inventory_schema.sql
-- Description: Inventory schema for card shops
-- Tables: user_card_stock,

-- =============================================
-- User Stock
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_card_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    core_card_id UUID NOT NULL REFERENCES public.core_cards(id) ON DELETE CASCADE,

    -- Stock details
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    condition VARCHAR(50) NOT NULL DEFAULT 'Near Mint',
    grading VARCHAR(50) DEFAULT 'Raw',

    -- Financial tracking
    cogs DECIMAL(10,2), -- Cost of Goods Sold
    estimated_value DECIMAL(10,2),

    -- Organization
    sku VARCHAR(100),
    location VARCHAR(200),
    language VARCHAR(50),
    notes TEXT,

    -- Soft delete for when user removes library access but wants to keep transaction history
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate entries for same user/card/condition/grading combination
    UNIQUE(user_id, core_card_id, condition, grading)
);


CREATE TYPE marketplace_type AS ENUM ('CardTrader', 'TCGplayer', 'eBay');

-- =============================================
-- User Card Listings ( MARKETPLACES )
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_card_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID NOT NULL REFERENCES public.user_card_stock(id) ON DELETE CASCADE,
    marketplace marketplace_type NOT NULL, -- ENUM ahora
    marketplace_listing_id VARCHAR(200),
    listing_url TEXT,
    listed_quantity INTEGER NOT NULL CHECK (listed_quantity >= 0),
    listed_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stock_id, marketplace)
);

-- =============================================
-- Indexes for Performance
-- =============================================
-- Indexes for quick joins for stock
CREATE INDEX IF NOT EXISTS idx_user_card_listings_stock_id
ON public.user_card_listings(stock_id);

-- Indexes to filter by marketplaces
CREATE INDEX IF NOT EXISTS idx_user_card_listings_marketplace
ON public.user_card_listings(marketplace);

-- =============================================
-- Row Level Security (RLS)
-- =============================================


-- =============================================
-- Row Level Security (RLS) for user_card_listings
-- =============================================

-- Core tables (public read access)
ALTER TABLE public.user_card_stock ENABLE ROW LEVEL SECURITY;

-- RLS Policies: User library access
DROP POLICY IF EXISTS "Users can view their own stock" ON public.user_card_stock;
CREATE POLICY "Users can view their own stock" ON public.user_card_stock FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create stock" ON public.user_card_stock;
CREATE POLICY "Users can create stock" ON public.user_card_stock FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own stock" ON public.user_card_stock;
CREATE POLICY "Users can delete their own stock" ON public.user_card_stock FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.user_card_listings ENABLE ROW LEVEL SECURITY;

-- Users can view their own listings
DROP POLICY IF EXISTS "Users can view their own listings" ON public.user_card_listings;
CREATE POLICY "Users can view their own listings"
ON public.user_card_listings
FOR SELECT
USING (
    stock_id IN (SELECT id FROM public.user_card_stock WHERE user_id = auth.uid())
);

-- Users can create listings only for their own stock
DROP POLICY IF EXISTS "Users can create listings" ON public.user_card_listings;
CREATE POLICY "Users can create listings"
ON public.user_card_listings
FOR INSERT
WITH CHECK (
    stock_id IN (SELECT id FROM public.user_card_stock WHERE user_id = auth.uid())
);

-- Users can update their own listings
DROP POLICY IF EXISTS "Users can update their own listings" ON public.user_card_listings;
CREATE POLICY "Users can update their own listings"
ON public.user_card_listings
FOR UPDATE
USING (
    stock_id IN (SELECT id FROM public.user_card_stock WHERE user_id = auth.uid())
);

-- Users can delete their own listings
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.user_card_listings;
CREATE POLICY "Users can delete their own listings"
ON public.user_card_listings
FOR DELETE
USING (
    stock_id IN (SELECT id FROM public.user_card_stock WHERE user_id = auth.uid())
);

COMMIT;
