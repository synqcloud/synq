-- Migration: 20250814_drop_user_library_access.sql
-- Description: Remove user library access control - all users now have access to all libraries

BEGIN;

-- =============================================
-- Drop User Library Access Table
-- =============================================

-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can view their own library access" ON public.user_library_access;
DROP POLICY IF EXISTS "Users can manage their own library access" ON public.user_library_access;

-- Drop trigger
DROP TRIGGER IF EXISTS update_user_library_access_updated_at ON public.user_library_access;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_library_access_user_id;
DROP INDEX IF EXISTS idx_user_library_access_library_id;

-- Drop table
DROP TABLE IF EXISTS public.user_library_access;

COMMIT;

-- =============================================
-- Update get_user_libraries_with_stock
-- =============================================

DROP FUNCTION IF EXISTS public.get_user_libraries_with_stock(UUID, UUID[], INT, INT, TEXT);
DROP FUNCTION IF EXISTS public.get_user_libraries_with_stock(UUID, TEXT, INT, INT);

CREATE OR REPLACE FUNCTION get_user_libraries_with_stock(
  p_user_id uuid,
  p_stock_filter text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name character varying,
  stock integer,
  total_value numeric(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
      l.id,
      l.name,
      CASE WHEN COUNT(ucs.id) = 0 THEN NULL
           ELSE SUM(ucs.quantity)::INT
      END AS stock,
      SUM(COALESCE(ucs.quantity, 0) * COALESCE(ccp.tcgplayer_price, 0))::NUMERIC(10,2) AS total_value
  FROM core_libraries l
  LEFT JOIN core_sets   s  ON s.core_library_id = l.id
  LEFT JOIN core_cards  c  ON c.core_set_id     = s.id
  LEFT JOIN user_card_stock ucs
         ON ucs.core_card_id = c.id
        AND ucs.user_id      = p_user_id
        AND ucs.is_active    = TRUE
  LEFT JOIN core_card_prices ccp
         ON ccp.core_card_id = c.id
  WHERE l.status = 'active'
  GROUP BY l.id, l.name
  HAVING
    CASE p_stock_filter
      WHEN 'in-stock' THEN
        SUM(COALESCE(ucs.quantity,0)) > 0
      WHEN 'out-of-stock' THEN
        COUNT(ucs.id) > 0 AND SUM(COALESCE(ucs.quantity,0)) = 0
      WHEN 'all' THEN
        COUNT(ucs.id) > 0  -- Has stock records
      ELSE TRUE
    END
  ORDER BY l.name
  OFFSET p_offset
  LIMIT  COALESCE(p_limit, NULL);
END;
$$;


-- =============================================
-- Update get_user_sets_with_stock (if exists)
-- =============================================

DROP FUNCTION IF EXISTS public.get_user_sets_with_stock(UUID, UUID, TEXT, INT, INT);

CREATE OR REPLACE FUNCTION get_user_sets_with_stock(
  p_user_id uuid,
  p_library_id uuid DEFAULT NULL,
  p_stock_filter text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name character varying,
  stock integer,
  total_value numeric(10,2),
  core_library_id uuid,
  core_library_name text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
      s.id,
      s.name,
      CASE WHEN COUNT(ucs.id) = 0 THEN NULL
           ELSE SUM(ucs.quantity)::INT
      END AS stock,
      SUM(COALESCE(ucs.quantity, 0) * COALESCE(ccp.tcgplayer_price, 0))::NUMERIC(10,2) AS total_value,
      l.id AS core_library_id,
      l.name::text AS core_library_name
  FROM core_sets s
  JOIN core_libraries l ON l.id = s.core_library_id
  LEFT JOIN core_cards  c  ON c.core_set_id = s.id
  LEFT JOIN user_card_stock ucs
         ON ucs.core_card_id = c.id
        AND ucs.user_id      = p_user_id
        AND ucs.is_active    = TRUE
  LEFT JOIN core_card_prices ccp
         ON ccp.core_card_id = c.id
  WHERE (p_library_id IS NULL OR s.core_library_id = p_library_id)
    AND l.status = 'active'
  GROUP BY s.id, s.name, l.id, l.name
  HAVING
    CASE p_stock_filter
      WHEN 'in-stock' THEN
        SUM(COALESCE(ucs.quantity,0)) > 0
      WHEN 'out-of-stock' THEN
        COUNT(ucs.id) > 0 AND SUM(COALESCE(ucs.quantity,0)) = 0
      WHEN 'all' THEN
        COUNT(ucs.id) > 0  -- Has stock records
      ELSE TRUE
    END
  ORDER BY s.name
  OFFSET p_offset
  LIMIT  COALESCE(p_limit, NULL);
END;
$$;


-- =============================================
-- Update get_user_cards_with_stock
-- =============================================

DROP FUNCTION IF EXISTS public.get_user_cards_with_stock(UUID, UUID, TEXT, INT, INT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_user_cards_with_stock(UUID, UUID, TEXT, INT, INT, TEXT);

CREATE OR REPLACE FUNCTION public.get_user_cards_with_stock(
    p_user_id      UUID,
    p_set_id       UUID DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL,
    p_offset       INT DEFAULT 0,
    p_limit        INT DEFAULT NULL,
    p_stock_filter TEXT DEFAULT 'all',
    p_sort_by      TEXT DEFAULT 'name'
)
RETURNS TABLE (
    id   UUID,
    name VARCHAR,
    tcgplayer_id TEXT,
    image_url TEXT,
    rarity VARCHAR(100),
    collector_number VARCHAR(50),
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
      c.collector_number,
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
  LEFT JOIN user_card_stock ucs
         ON ucs.core_card_id = c.id
        AND ucs.user_id      = p_user_id
        AND ucs.is_active    = TRUE
  LEFT JOIN core_card_prices ccp
         ON ccp.core_card_id = c.id
  WHERE (p_set_id IS NULL OR c.core_set_id = p_set_id)
    AND (p_search_query IS NULL OR
         c.name ILIKE '%' || p_search_query || '%' OR
         c.collector_number ILIKE '%' || p_search_query || '%')
    AND cl.status = 'active'
  GROUP BY c.id, c.name, c.tcgplayer_id, c.image_url, c.rarity,
           c.collector_number, ccp.tcgplayer_price, cs.name, cl.name
  HAVING
    CASE p_stock_filter
      WHEN 'in-stock'     THEN SUM(COALESCE(ucs.quantity,0)) > 0
      WHEN 'out-of-stock' THEN COUNT(ucs.id) > 0 AND SUM(COALESCE(ucs.quantity,0)) = 0
      WHEN 'all'          THEN COUNT(ucs.id) > 0  -- Has stock records
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
  LIMIT  COALESCE(p_limit, NULL);
END;
$$;


DROP FUNCTION IF EXISTS public.search_cards_by_library(UUID, UUID, TEXT, INT, INT);
CREATE OR REPLACE FUNCTION public.search_cards_by_library(
    p_library_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL,
    p_offset INT DEFAULT 0,
    p_limit INT DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    tcgplayer_id TEXT,
    image_url TEXT,
    rarity TEXT,
    collector_number TEXT,
    core_set_name TEXT,
    stock INT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
      c.id,
      c.name::TEXT,
      c.tcgplayer_id,
      c.image_url,
      c.rarity::TEXT,
      c.collector_number::TEXT,
      cs.name::TEXT AS core_set_name,
      COALESCE(SUM(ucs.quantity), 0)::INT AS stock
  FROM core_cards c
  JOIN core_sets cs
    ON cs.id = c.core_set_id
  LEFT JOIN user_card_stock ucs
         ON ucs.core_card_id = c.id
        AND (p_user_id IS NULL OR ucs.user_id = p_user_id)
        AND ucs.is_active = TRUE
  WHERE c.core_library_id = p_library_id
    AND (p_search_query IS NULL OR
         c.name ILIKE '%' || p_search_query || '%' OR
         c.collector_number ILIKE '%' || p_search_query || '%')
  GROUP BY c.id, c.name, c.tcgplayer_id, c.image_url, c.rarity,
           c.collector_number, cs.name
  ORDER BY c.name
  OFFSET p_offset
  LIMIT COALESCE(p_limit, 50);
END;
$$;
