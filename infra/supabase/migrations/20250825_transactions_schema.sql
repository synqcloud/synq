-- Migration: 20250825_transactions_schema.sql
-- Description: Transactions schema for card shops
-- Tables: user_transactions, user_transaction_items

-- =============================================
-- Table: user_transactions
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User who owns the transaction log (shop owner)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Type of transaction
    transaction_type TEXT NOT NULL CHECK (
      transaction_type IN (
        'SALE',
        'PURCHASE',
        'TRADE_IN',
        'TRADE_OUT',
        'GRADING_SUBMIT',
        'GRADING_RETURN',
        'CONSIGNMENT_IN',
        'CONSIGNMENT_OUT',
        'DAMAGE_LOSS',
        'RETURN_REFUND',
        'ADJUSTMENT',
        'FEE_ONLY'
      )
    ),

    -- Who performed the transaction (employee / owner / system)
    performed_by UUID REFERENCES auth.users(id),

    -- Source (marketplace, in-store, vendor, etc.)
    source TEXT,

    -- Net amount (positive or negative depending on transaction)
    net_amount NUMERIC(10,2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Table: user_transaction_items
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    transaction_id UUID NOT NULL REFERENCES public.user_transactions(id) ON DELETE CASCADE,

    stock_id UUID NOT NULL REFERENCES public.user_card_stock(id) ON DELETE CASCADE,

    -- Number of cards/items affected
    quantity INTEGER NOT NULL CHECK (quantity > 0),

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
    cc.name AS card_name
FROM public.user_transaction_items uti
JOIN public.user_card_stock ucs ON uti.stock_id = ucs.id
JOIN public.core_cards cc ON ucs.core_card_id = cc.id;


-- =============================================
-- Stock update trigger
-- =============================================

CREATE OR REPLACE FUNCTION apply_stock_change()
RETURNS TRIGGER AS $$
DECLARE
  tx_type TEXT;
BEGIN
  SELECT transaction_type INTO tx_type
  FROM user_transactions
  WHERE id = NEW.transaction_id;

  IF tx_type IN ('SALE', 'TRADE_OUT', 'GRADING_SUBMIT', 'CONSIGNMENT_OUT', 'DAMAGE_LOSS') THEN
    -- Decrease stock
    PERFORM 1
    FROM user_card_stock
    WHERE id = NEW.stock_id AND quantity >= NEW.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Not enough stock for stock_id %, requested %, available less',
        NEW.stock_id, NEW.quantity;
    END IF;

    UPDATE user_card_stock
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.stock_id;

  ELSIF tx_type IN ('PURCHASE', 'TRADE_IN', 'GRADING_RETURN', 'CONSIGNMENT_IN', 'RETURN_REFUND') THEN
    -- Increase stock
    UPDATE user_card_stock
    SET quantity = quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.stock_id;

  ELSIF tx_type = 'ADJUSTMENT' THEN
    -- Adjustment: can go negative or positive
    UPDATE user_card_stock
    SET quantity = quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.stock_id;

  ELSIF tx_type = 'FEE_ONLY' THEN
    -- No stock change
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apply_stock_change
BEFORE INSERT ON public.user_transaction_items
FOR EACH ROW
EXECUTE FUNCTION apply_stock_change();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_transaction_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: user_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.user_transactions;
CREATE POLICY "Users can view their own transactions" ON public.user_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.user_transactions;
CREATE POLICY "Users can insert their own transactions" ON public.user_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies: user_transaction_items
DROP POLICY IF EXISTS "Users can view their own transaction items" ON public.user_transaction_items;
CREATE POLICY "Users can view their own transaction items" ON public.user_transaction_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.user_transactions t
      WHERE t.id = user_transaction_items.transaction_id
      AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own transaction items" ON public.user_transaction_items;
CREATE POLICY "Users can insert their own transaction items" ON public.user_transaction_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_transactions t
      WHERE t.id = user_transaction_items.transaction_id
      AND t.user_id = auth.uid()
    )
  );

COMMIT;
