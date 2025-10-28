-- Migration: Create get_user_inventory_summary function
-- Created: 2025-10-09
-- Returns total unique items, total quantity, and total value across all user inventory

-- =============================================
-- Drop existing function if it exists
-- =============================================

DROP FUNCTION IF EXISTS get_user_inventory_summary(uuid);

-- =============================================
-- Create get_user_inventory_summary function
-- =============================================

CREATE OR REPLACE FUNCTION get_user_inventory_summary(
  p_user_id uuid
)
RETURNS TABLE (
  total_items integer,
  total_stock integer,
  total_inventory_value numeric(10,2)
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
      COUNT(DISTINCT ucs.core_card_id)::INTEGER AS total_items,
      SUM(ucs.quantity)::INTEGER AS total_stock,
      SUM(ucs.quantity * COALESCE(ccp.tcgplayer_price, 0))::NUMERIC(10,2) AS total_inventory_value
  FROM user_card_stock ucs
  LEFT JOIN core_card_prices ccp
         ON ccp.core_card_id = ucs.core_card_id
  WHERE ucs.user_id = p_user_id
    AND ucs.is_active = TRUE
    AND ucs.quantity > 0;
END;
$$;

-- =============================================
-- Add comment
-- =============================================

COMMENT ON FUNCTION get_user_inventory_summary IS
'Returns aggregate inventory statistics for a user: total unique items (distinct cards), total stock quantity across all cards, and total inventory value based on TCGPlayer prices';
