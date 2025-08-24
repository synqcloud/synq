-- Migration: 20250811_inventory_schema.sql
-- Description: Inventory schema for card shops
-- Tables: user_card_stock


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
    notes TEXT,

    -- Soft delete for when user removes library access but wants to keep transaction history
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate entries for same user/card/condition/grading combination
    UNIQUE(user_id, core_card_id, condition, grading)
);


-- =============================================
-- Row Level Security (RLS)
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

COMMIT;
