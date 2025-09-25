-- Migration: 20250908_notifications_schema.sql
-- Description: Core Library schema for notifications
-- Tables: core_libraries, core_sets, core_cards, user_library_access

BEGIN;

-- =============================================
-- Type: notification_type
-- =============================================
DROP TYPE IF EXISTS public.notification_type CASCADE;

CREATE TYPE public.notification_type AS ENUM (
    'discrepancy_stock',       -- Inventory Discrepancies
    'price_alert'              -- Notifications from price alerts
);

-- =============================================
-- Table: notifications (User-facing alerts)
-- =============================================
DROP TABLE IF EXISTS public.notifications CASCADE;
-- TODO: this table needs redesign for scalability
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,                          -- who receives the notification

    -- Stock-related notifications (optional)
    stock_id UUID REFERENCES public.user_card_stock(id) ON DELETE CASCADE,
    marketplace_id UUID REFERENCES public.marketplaces(id) ON DELETE CASCADE, -- the affected marketplace

    -- Price alert notifications (optional)
    core_card_id UUID REFERENCES public.core_cards(id) ON DELETE CASCADE,

    notification_type public.notification_type NOT NULL,  -- type of notification
    message TEXT,                                          -- notification message
    metadata JSONB,                                        -- additional data (price changes, etc.)

    is_read BOOLEAN DEFAULT FALSE,                  -- read/unread status
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint: at least one reference must be provided
    CONSTRAINT check_notification_reference CHECK (
        stock_id IS NOT NULL OR core_card_id IS NOT NULL
    )
);

-- =============================================
-- Function: perform_stock_transaction
-- =============================================
DROP FUNCTION IF EXISTS public.perform_stock_transaction(
    UUID, TEXT, INT, INT, UUID, NUMERIC, TEXT, NUMERIC, NUMERIC, NUMERIC
);

CREATE OR REPLACE FUNCTION public.perform_stock_transaction(
    p_stock_id UUID,
    p_change_type TEXT,
    p_quantity_change INT DEFAULT 0,
    p_quantity_new INT DEFAULT NULL,
    p_performed_by UUID DEFAULT NULL,
    p_unit_price NUMERIC DEFAULT NULL,
    p_marketplace TEXT DEFAULT NULL,
    p_tax_amount NUMERIC DEFAULT 0,
    p_shipping_amount NUMERIC DEFAULT 0,
    p_net_amount NUMERIC DEFAULT NULL
)
RETURNS TABLE(
    quantity_before INT,
    quantity_after INT,
    discrepancy BOOLEAN,
    transaction_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_stock RECORD;
    v_quantity_before INT;
    v_quantity_after INT;
    v_discrepancy BOOLEAN := false;
    v_transaction_type TEXT;  -- Use TEXT instead of enum to avoid search_path issues
    v_transaction_id UUID;
BEGIN
    -- Lock the stock row to prevent concurrent modifications
    SELECT * INTO v_stock
    FROM public.user_card_stock
    WHERE id = p_stock_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Stock not found';
    END IF;

    v_quantity_before := v_stock.quantity;

    -- Determine the effective quantity
    IF p_quantity_new IS NOT NULL THEN
        v_quantity_after := p_quantity_new;
    ELSE
        v_quantity_after := v_quantity_before + p_quantity_change;
    END IF;

    -- Handle discrepancies - only if stock_discrepancies table exists
    IF v_quantity_after < 0 THEN
        v_discrepancy := true;
        -- Comment out if stock_discrepancies table doesn't exist
        /*
        INSERT INTO public.stock_discrepancies(
            stock_id, expected_quantity, actual_quantity, quantity_change, change_type
        ) VALUES (
            p_stock_id, p_quantity_change, v_quantity_before, p_quantity_change, p_change_type
        );
        */
        v_quantity_after := 0;
    END IF;

    -- Update stock quantity
    UPDATE public.user_card_stock
    SET quantity = v_quantity_after, updated_at = NOW()
    WHERE id = p_stock_id;

    -- Map change_type to transaction_type string
    IF p_change_type = 'marketplace_sale' THEN
        v_transaction_type := 'sale';
    ELSE
        v_transaction_type := 'purchase';  -- Assuming purchase is valid, adjust as needed
    END IF;

    -- Insert transaction with proper type casting
    INSERT INTO public.user_transaction(
        user_id, transaction_status, transaction_type, performed_by, source, is_integration,
        subtotal_amount, tax_amount, shipping_amount, net_amount
    )
    VALUES (
        v_stock.user_id,
        'COMPLETED'::public.transaction_status,
        v_transaction_type::public.transaction_type,
        p_performed_by,
        p_marketplace,
        p_change_type = 'marketplace_sale',
        COALESCE(p_unit_price, v_stock.cogs, 0) * ABS(v_quantity_before - v_quantity_after),
        p_tax_amount,
        p_shipping_amount,
        COALESCE(p_net_amount, COALESCE(p_unit_price, v_stock.cogs, 0) * ABS(v_quantity_before - v_quantity_after))
    )
    RETURNING id INTO v_transaction_id;

    -- Insert transaction item
    INSERT INTO public.user_transaction_items(
        transaction_id, stock_id, quantity, unit_price
    ) VALUES (
        v_transaction_id, p_stock_id, ABS(v_quantity_before - v_quantity_after), COALESCE(p_unit_price, v_stock.cogs, 0)
    );

    -- Return result
    RETURN QUERY SELECT v_quantity_before, v_quantity_after, v_discrepancy, v_transaction_id;
END;
$$;

-- =============================================
-- Indexes for better performance
-- =============================================
DROP INDEX IF EXISTS idx_notifications_user_unread;
DROP INDEX IF EXISTS idx_notifications_price_alerts;

CREATE INDEX idx_notifications_user_unread
    ON public.notifications(user_id, is_read)
    WHERE is_read = FALSE;

CREATE INDEX idx_notifications_price_alerts
    ON public.notifications(core_card_id, notification_type)
    WHERE notification_type = 'price_alert';

-- =============================================
-- Security hardening: RLS and View security
-- =============================================

-- Ensure the view runs with invoker rights (not definer)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'user_transaction_items_with_cards'
  ) THEN
    EXECUTE 'ALTER VIEW public.user_transaction_items_with_cards SET (security_invoker = on)';
  END IF;
END$$;

-- Enable RLS on public tables exposed via PostgREST
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());

COMMIT;
