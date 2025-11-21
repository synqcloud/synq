-- Migration: 20251122_price_by_user_currency.sql
-- Description: Update get_user_cards_with_stock to return a single card_price based on user's currency preference.

BEGIN;

-- =============================================
-- Update get_user_cards_with_stock
-- =============================================

-- Drop the existing function(s) to allow for re-creation
DROP FUNCTION IF EXISTS public.get_user_cards_with_stock(UUID, UUID, TEXT, INT, INT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_user_cards_with_stock(UUID, UUID, TEXT, INT, INT, TEXT);

CREATE OR REPLACE FUNCTION public.get_user_cards_with_stock(
    p_user_id UUID,
    p_set_id UUID DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL,
    p_offset INT DEFAULT 0,
    p_limit INT DEFAULT NULL,
    p_stock_filter TEXT DEFAULT 'all',
    p_sort_by TEXT DEFAULT 'name'
)
RETURNS TABLE (
    id  UUID,
    name VARCHAR,
    tcgplayer_id TEXT,
    image_url TEXT,
    rarity VARCHAR(100),
    collector_number VARCHAR(50),
    stock INT,
    tcgplayer_price DECIMAL(10,2),
    cardmarket_price DECIMAL(10,2),
    card_price DECIMAL(10,2),  -- New column for the user's preferred price
    core_set_name TEXT,
    core_library_name TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.tcgplayer_id,
        c.image_url,
        c.rarity,
        c.collector_number,
        CASE WHEN COUNT(ucs.id) = 0 THEN NULL
             ELSE SUM(ucs.quantity)::INT
        END AS stock,
        ccp.tcgplayer_price,
        ccp.cardmarket_price,
        -- Calculate the user's preferred card_price based on currency setting
        CASE up.currency
            WHEN 'EUR' THEN ccp.cardmarket_price
            WHEN 'USD' THEN ccp.tcgplayer_price
            ELSE ccp.tcgplayer_price -- Default to USD/TCGPlayer if preference is missing/invalid
        END::DECIMAL(10,2) AS card_price,
        cs.name::text  AS core_set_name,
        cl.name::text  AS core_library_name
    FROM core_cards c
    JOIN core_sets cs
      ON cs.id = c.core_set_id
    JOIN core_libraries cl
      ON cl.id = c.core_library_id
    -- Join user_preferences to get the currency setting
    JOIN public.user_preferences up
      ON up.user_id = p_user_id
    LEFT JOIN user_card_stock ucs
             ON ucs.core_card_id = c.id
            AND ucs.user_id = p_user_id
            AND ucs.is_active = TRUE
    LEFT JOIN core_card_prices ccp
             ON ccp.core_card_id = c.id
    WHERE (p_set_id IS NULL OR c.core_set_id = p_set_id)
      AND (p_search_query IS NULL OR
           c.name ILIKE '%' || p_search_query || '%' OR
           c.collector_number ILIKE '%' || p_search_query || '%')
      AND cl.status = 'active'
    GROUP BY c.id, c.name, c.tcgplayer_id, c.image_url, c.rarity,
             c.collector_number, ccp.tcgplayer_price, ccp.cardmarket_price, cs.name, cl.name, up.currency
    HAVING
      CASE p_stock_filter
        WHEN 'in-stock' THEN SUM(COALESCE(ucs.quantity,0)) > 0
        WHEN 'out-of-stock' THEN COUNT(ucs.id) > 0 AND SUM(COALESCE(ucs.quantity,0)) = 0
        WHEN 'all' THEN COUNT(ucs.id) > 0 -- Has stock records
        ELSE TRUE
      END
    ORDER BY
      CASE
        WHEN p_sort_by = 'collector_number' THEN
          LPAD(REGEXP_REPLACE(c.collector_number, '[^0-9]', '', 'g'), 10, '0')
        ELSE NULL
      END,
      CASE WHEN p_sort_by = 'name' THEN c.name ELSE NULL END
    OFFSET p_offset
    LIMIT COALESCE(p_limit, NULL);
END;
$$;

COMMIT;
