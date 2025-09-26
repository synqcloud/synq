-- Migration: 20250926_alter_inventory_functions.sql
-- Description: Alters functions from original schema to match new version

-- =============================================
-- STEP 1: Update get_user_cards_with_stock
-- =============================================

-- Drop old version (to allow signature change: params + return type)
DROP FUNCTION IF EXISTS public.get_user_cards_with_stock(UUID, UUID, INT, INT, TEXT);

CREATE FUNCTION public.get_user_cards_with_stock(
    p_user_id      UUID,
    p_set_id       UUID DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL,
    p_offset       INT DEFAULT 0,
    p_limit        INT DEFAULT NULL,
    p_stock_filter TEXT DEFAULT 'all'
)
RETURNS TABLE (
    id   UUID,
    name VARCHAR,
    tcgplayer_id TEXT,
    image_url TEXT,
    rarity VARCHAR(100),
    stock INT,
    tcgplayer_price DECIMAL(10,2),
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
      CASE WHEN COUNT(ucs.id) = 0 THEN NULL
           ELSE SUM(ucs.quantity)::INT
      END AS stock,
      ccp.tcgplayer_price,
      cs.name::text   AS core_set_name,
      cl.name::text   AS core_library_name
  FROM core_cards c
  JOIN core_sets cs
    ON cs.id = c.core_set_id
  JOIN core_libraries cl
    ON cl.id = c.core_library_id
  JOIN user_library_access ula
    ON ula.core_library_id = cl.id
   AND ula.user_id = p_user_id
  LEFT JOIN user_card_stock ucs
         ON ucs.core_card_id = c.id
        AND ucs.user_id      = p_user_id
        AND ucs.is_active    = TRUE
  LEFT JOIN core_card_prices ccp
         ON ccp.core_card_id = c.id
  WHERE (p_set_id IS NULL OR c.core_set_id = p_set_id)
    AND (p_search_query IS NULL OR c.name ILIKE '%' || p_search_query || '%')
    AND cl.status = 'active'
  GROUP BY c.id, c.name, c.tcgplayer_id, c.image_url, c.rarity,
           ccp.tcgplayer_price, cs.name, cl.name
  HAVING
    CASE p_stock_filter
      WHEN 'in-stock'     THEN SUM(COALESCE(ucs.quantity,0)) > 0
      WHEN 'out-of-stock' THEN COUNT(ucs.id) > 0 AND SUM(COALESCE(ucs.quantity,0)) = 0
      ELSE TRUE
    END
  ORDER BY c.name
  OFFSET p_offset
  LIMIT  COALESCE(p_limit, NULL);
END;
$$;

-- =============================================
-- STEP 2: Update get_user_sets_with_stock
-- =============================================

-- Drop old version (to allow return type change: added is_upcoming)
DROP FUNCTION IF EXISTS public.get_user_sets_with_stock(UUID, UUID, INT, INT, TEXT);

CREATE FUNCTION public.get_user_sets_with_stock(
    p_user_id      UUID,
    p_library_id   UUID,
    p_offset       INT DEFAULT 0,
    p_limit        INT DEFAULT NULL,
    p_stock_filter TEXT DEFAULT 'all'
)
RETURNS TABLE (
    id   UUID,
    name VARCHAR,
    stock INT,
    is_upcoming BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
      s.id,
      s.name,
      CASE WHEN COUNT(ucs.id) = 0 THEN NULL
           ELSE SUM(ucs.quantity)::INT
      END AS stock,
      (s.release_date > CURRENT_DATE) AS is_upcoming
  FROM core_sets s
  LEFT JOIN core_cards c ON c.core_set_id = s.id
  LEFT JOIN user_card_stock ucs
         ON ucs.core_card_id = c.id
        AND ucs.user_id      = p_user_id
  WHERE s.core_library_id = p_library_id
  GROUP BY s.id, s.name, s.release_date
  HAVING
    CASE p_stock_filter
      WHEN 'in-stock' THEN
        SUM(COALESCE(ucs.quantity,0)) > 0
      WHEN 'out-of-stock' THEN
        EXISTS (
          SELECT 1
          FROM core_cards c2
          LEFT JOIN user_card_stock u2
                 ON u2.core_card_id = c2.id
                AND u2.user_id      = p_user_id
          WHERE c2.core_set_id = s.id
          GROUP BY c2.id
          HAVING COUNT(u2.id) > 0 AND SUM(COALESCE(u2.quantity, 0)) = 0
        )
      ELSE TRUE
    END
  ORDER BY s.release_date DESC
  OFFSET p_offset
  LIMIT  COALESCE(p_limit, NULL);
END;
$$;
