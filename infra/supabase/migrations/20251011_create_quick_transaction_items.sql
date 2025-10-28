-- Function to fetch stock items for quick transaction
-- Takes an array of stock IDs and returns card details with pricing info
-- =============================================
-- Drop existing function if it exists
-- =============================================

DROP FUNCTION IF EXISTS get_quick_transaction_items(uuid[]);

-- =============================================
-- Create get_quick_transaction_items function
-- =============================================

CREATE OR REPLACE FUNCTION public.get_quick_transaction_items(
  p_stock_ids uuid[]
)
RETURNS TABLE (
  stock_id uuid,
  core_card_id uuid,
  card_name varchar(300),
  condition varchar(50),
  language varchar(50),
  max_quantity integer,
  tcgplayer_price numeric(10, 2),
  cardmarket_price numeric(10, 2),
  image_url text,
  collector_number varchar(50),
  set_name varchar(200),
  rarity varchar(100)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ucs.id AS stock_id,
    ucs.core_card_id,
    cc.name AS card_name,
    ucs.condition,
    ucs.language,
    ucs.quantity AS max_quantity,
    ccp.tcgplayer_price,
    ccp.cardmarket_price,
    cc.image_url,
    cc.collector_number,
    cs.name AS set_name,
    cc.rarity
  FROM
    public.user_card_stock ucs
  INNER JOIN
    public.core_cards cc ON ucs.core_card_id = cc.id
  LEFT JOIN
    public.core_card_prices ccp ON cc.id = ccp.core_card_id
  LEFT JOIN
    public.core_sets cs ON cc.core_set_id = cs.id
  WHERE
    ucs.id = ANY(p_stock_ids)
    AND ucs.is_active = true
    AND ucs.quantity > 0
  ORDER BY
    array_position(p_stock_ids, ucs.id);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_quick_transaction_items(uuid[]) TO authenticated;

-- Add comment to document the function
COMMENT ON FUNCTION public.get_quick_transaction_items(uuid[]) IS
'Fetches stock items with card details and pricing for quick transaction creation.
Returns card name, condition, language, max quantity, and current market prices.';
