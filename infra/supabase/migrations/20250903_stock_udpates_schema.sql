-- Migration: 20250903_stock_updates_schema.sql
-- Description: Track changes made to user card stock
-- Tables: user_stock_updates

-- =============================================
-- Table: user_stock_updates
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_stock_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User who made the update
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Stock entry that was updated
    stock_id UUID NOT NULL REFERENCES public.user_card_stock(id) ON DELETE CASCADE,

    -- Type of update (e.g., 'add', 'remove', 'adjust', etc.)
    update_type TEXT NOT NULL,

    -- Quantity change (positive or negative)
    quantity_change INTEGER NOT NULL,

    -- Optional note/reason for the update
    note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_stock_updates_user_created
ON public.user_stock_updates (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_stock_updates_stock_id
ON public.user_stock_updates (stock_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE public.user_stock_updates ENABLE ROW LEVEL SECURITY;

-- RLS: user_stock_updates
DROP POLICY IF EXISTS "Users can view their own stock updates" ON public.user_stock_updates;
CREATE POLICY "Users can view their own stock updates" ON public.user_stock_updates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own stock updates" ON public.user_stock_updates;
CREATE POLICY "Users can insert their own stock updates" ON public.user_stock_updates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stock updates" ON public.user_stock_updates;
CREATE POLICY "Users can update their own stock updates" ON public.user_stock_updates
  FOR UPDATE USING (auth.uid() = user_id);

COMMIT;
