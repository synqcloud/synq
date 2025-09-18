-- Migration: 20250916_price_alerts_schema.sql
-- Description: Core Library schema for card shops
-- Tables: user_card_price_alerts, core_card_prices, daily_processing_queue

BEGIN;

-- Drop tables first (policies and indexes are dropped automatically with CASCADE)
DROP TABLE IF EXISTS public.user_card_price_alerts CASCADE;
DROP TABLE IF EXISTS public.core_card_prices CASCADE;
DROP TABLE IF EXISTS daily_processing_queue CASCADE;

-- =============================================
-- Core card prices (we store the card prices here)
-- =============================================

CREATE TABLE public.core_card_prices (
    core_card_id UUID PRIMARY KEY REFERENCES public.core_cards(id) ON DELETE CASCADE,
    tcgplayer_price DECIMAL(10,2),
    cardmarket_price DECIMAL(10,2)
);

-- =============================================
-- User card price alerts
-- =============================================

CREATE TABLE public.user_card_price_alerts (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    core_card_id UUID NOT NULL REFERENCES public.core_cards(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, core_card_id)
);

-- =============================================
-- Daily processing queue (Used only by the Edge Function every 24h)
-- =============================================

CREATE TABLE daily_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  core_card_id UUID REFERENCES public.core_cards(id),
  created_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  processed_at TIMESTAMP,
  attempts INTEGER DEFAULT 0,
  CONSTRAINT daily_queue_unique UNIQUE (core_card_id, created_date)
);

-- =============================================
-- Function: Get User Price Alerts Batch (optimized function for the front-end inventory view)
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_price_alerts_batch(
    p_card_ids UUID[]
)
RETURNS TABLE(core_card_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT core_card_id
    FROM public.user_card_price_alerts
    WHERE user_id = auth.uid()
      AND core_card_id = ANY(p_card_ids);
$$;


-- =============================================
-- Enable Row Level Security (RLS)
-- =============================================

ALTER TABLE public.core_card_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_card_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_processing_queue ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Core card prices: all authenticated users can read
CREATE POLICY "Allow read access to all authenticated users" ON public.core_card_prices
    FOR SELECT TO authenticated
    USING (true);

-- User card price alerts: users can manage their own alerts
CREATE POLICY "Users can view their own price alerts" ON public.user_card_price_alerts
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own price alerts" ON public.user_card_price_alerts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts" ON public.user_card_price_alerts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts" ON public.user_card_price_alerts
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Daily processing queue: only service role can access. allows ALL operations (SELECT, INSERT, UPDATE, DELETE) for the service role only.
CREATE POLICY "Only service role can access daily_processing_queue"
ON daily_processing_queue
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Revoke all permissions from public/authenticated users
REVOKE ALL ON daily_processing_queue FROM public;
REVOKE ALL ON daily_processing_queue FROM authenticated;

-- Grant necessary permissions only to service_role (used by edge functions)
GRANT ALL ON daily_processing_queue TO service_role;


-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_user_card_price_alerts_user_id
ON public.user_card_price_alerts(user_id);

CREATE INDEX idx_user_card_price_alerts_core_card_id
ON public.user_card_price_alerts(core_card_id);

CREATE INDEX idx_daily_queue_status_date
ON daily_processing_queue (created_date, status);

CREATE INDEX idx_daily_queue_core_card
ON daily_processing_queue (core_card_id);


COMMIT;
