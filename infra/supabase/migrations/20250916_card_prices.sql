-- Core card prices table
CREATE TABLE IF NOT EXISTS public.core_card_prices (
    core_card_id UUID PRIMARY KEY REFERENCES public.core_cards(id) ON DELETE CASCADE,
    tcgplayer_price DECIMAL(10,2),
    cardmarket_price DECIMAL(10,2)
);

-- User card price alerts table
CREATE TABLE IF NOT EXISTS public.user_card_price_alerts (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    core_card_id UUID NOT NULL REFERENCES public.core_cards(id) ON DELETE CASCADE,

    PRIMARY KEY (user_id, core_card_id)
);

-- Enable RLS
ALTER TABLE public.core_card_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_card_price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for core_card_prices (read-only for all authenticated users)
CREATE POLICY "Allow read access to all authenticated users" ON public.core_card_prices
    FOR SELECT TO authenticated
    USING (true);

-- RLS Policies for user_card_price_alerts (users can only access their own alerts)
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

-- Indexes
-- Index for user_card_price_alerts - query by user_id
CREATE INDEX IF NOT EXISTS idx_user_card_price_alerts_user_id
ON public.user_card_price_alerts(user_id);

-- Index for user_card_price_alerts - query by core_card_id (to find all users watching a card)
CREATE INDEX IF NOT EXISTS idx_user_card_price_alerts_core_card_id
ON public.user_card_price_alerts(core_card_id);
