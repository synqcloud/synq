-- =============================================
-- Table: stock_audit_log
-- =============================================
CREATE TABLE IF NOT EXISTS public.stock_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID NOT NULL REFERENCES public.user_card_stock(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    performed_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Table: notification_type (opcional como enum)
-- =============================================
CREATE TYPE public.notification_type AS ENUM (
    'discrepancy_stock',       -- Cantidad negativa o inconsistencias
    'price_update_suggestion', -- Cambio de precio sugerido desde TCGMarket, TCGPlayer, etc.
    'price_alert',             -- Alerta de precio para usuarios
    'general_alert'            -- Otros avisos generales
);

-- =============================================
-- Table: notifications
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,                          -- who receives the notification

    -- Stock-related notifications (optional)
    stock_id UUID REFERENCES public.user_card_stock(id) ON DELETE CASCADE,
    stock_audit_id UUID REFERENCES public.stock_audit_log(id) ON DELETE CASCADE,
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
-- Indexes for better performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON public.notifications(user_id, is_read)
WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_price_alerts
ON public.notifications(core_card_id, notification_type)
WHERE notification_type = 'price_alert';

-- =============================================
-- Note: Removed PostgreSQL trigger and function
-- Stock audit will now be inserted from Edge Functions
-- =============================================

-- =============================================
-- Function: perform_stock_transaction
-- Description: Performs a stock update and creates the corresponding transaction atomically
-- =============================================
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
) AS $$
DECLARE
    v_stock RECORD;
    v_quantity_before INT;
    v_quantity_after INT;
    v_discrepancy BOOLEAN := false;
    v_transaction_type transaction_type;
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

    -- Handle discrepancies
    IF v_quantity_after < 0 THEN
        v_discrepancy := true;
        INSERT INTO public.stock_discrepancies(
            stock_id, expected_quantity, actual_quantity, quantity_change, change_type
        ) VALUES (
            p_stock_id, p_quantity_change, v_quantity_before, p_quantity_change, p_change_type
        );
        v_quantity_after := 0;
    END IF;

    -- Update stock quantity
    UPDATE public.user_card_stock
    SET quantity = v_quantity_after, updated_at = NOW()
    WHERE id = p_stock_id;

    -- Map change_type to transaction_type
    IF p_change_type = 'marketplace_sale' THEN
        v_transaction_type := 'sale';
    ELSE
        v_transaction_type := 'purchase';
    END IF;

    -- Insert transaction
    INSERT INTO public.user_transaction(
        user_id, transaction_status, transaction_type, performed_by, source, is_integration,
        subtotal_amount, tax_amount, shipping_amount, net_amount
    )
    VALUES (
        v_stock.user_id, 'COMPLETED', v_transaction_type, p_performed_by, p_marketplace,
        p_change_type = 'marketplace_sale',
        COALESCE(p_unit_price, v_stock.cogs, 0) * ABS(v_quantity_before - v_quantity_after),
        p_tax_amount, p_shipping_amount,
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
$$ LANGUAGE plpgsql;
