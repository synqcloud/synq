-- ============================================================================
-- COMPLETE FIXED MIGRATION: All inventory functions with NULL handling
-- ============================================================================

-- ============================================================================
-- NUCLEAR OPTION: Drop ALL versions of functions using pg_proc
-- ============================================================================

-- Drop all versions of get_user_libraries_with_stock
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT oid::regprocedure
        FROM pg_proc
        WHERE proname = 'get_user_libraries_with_stock'
    LOOP
        EXECUTE 'DROP FUNCTION ' || r.oid::regprocedure || ' CASCADE';
    END LOOP;
END $$;

-- Drop all versions of get_user_sets_with_stock
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT oid::regprocedure
        FROM pg_proc
        WHERE proname = 'get_user_sets_with_stock'
    LOOP
        EXECUTE 'DROP FUNCTION ' || r.oid::regprocedure || ' CASCADE';
    END LOOP;
END $$;

-- Drop all versions of get_user_cards_with_stock
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT oid::regprocedure
        FROM pg_proc
        WHERE proname = 'get_user_cards_with_stock'
    LOOP
        EXECUTE 'DROP FUNCTION ' || r.oid::regprocedure || ' CASCADE';
    END LOOP;
END $$;

-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Add missing indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_stock_listings_marketplace_stock
  ON user_stock_listings(marketplace_id, stock_id);

CREATE INDEX IF NOT EXISTS idx_user_card_stock_user_card_active
  ON user_card_stock(user_id, core_card_id, is_active)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_core_card_prices_card_id
  ON core_card_prices(core_card_id);

-- ============================================================================
-- OPTIMIZED: get_user_libraries_with_stock
-- ============================================================================

CREATE FUNCTION get_user_libraries_with_stock(
  p_library_ids uuid[],
  p_user_id uuid,
  p_stock_filter text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL,
  p_marketplace_filter text DEFAULT 'all'
)
RETURNS TABLE (
  id uuid,
  name character varying(100),
  stock integer,
  total_value numeric(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_stock AS (
    SELECT
      ucs.id as stock_id,
      ucs.core_card_id,
      ucs.quantity
    FROM user_card_stock ucs
    WHERE ucs.user_id = p_user_id
      AND ucs.is_active = TRUE
  ),
  stock_listings AS (
    SELECT DISTINCT
      usl.stock_id,
      m.name as marketplace_name
    FROM user_stock_listings usl
    JOIN marketplaces m ON m.id = usl.marketplace_id
    WHERE EXISTS (
      SELECT 1 FROM user_stock us
      WHERE us.stock_id = usl.stock_id
    )
  ),
  filtered_stock AS (
    SELECT
      us.stock_id,
      us.core_card_id,
      us.quantity
    FROM user_stock us
    WHERE
      CASE p_marketplace_filter
        WHEN 'all' THEN TRUE
        WHEN 'not-listed' THEN
          NOT EXISTS (
            SELECT 1 FROM stock_listings sl
            WHERE sl.stock_id = us.stock_id
          )
        ELSE EXISTS (
          SELECT 1 FROM stock_listings sl
          WHERE sl.stock_id = us.stock_id
            AND sl.marketplace_name = p_marketplace_filter
        )
      END
  ),
  library_aggregates AS (
    SELECT
      c.core_library_id as library_id,
      COUNT(DISTINCT c.id) as card_count,
      SUM(fs.quantity) as total_quantity,
      SUM(fs.quantity * COALESCE(ccp.tcgplayer_price, 0)) as total_value
    FROM filtered_stock fs
    JOIN core_cards c ON c.id = fs.core_card_id
    LEFT JOIN core_card_prices ccp ON ccp.core_card_id = c.id
    WHERE c.core_library_id = ANY(p_library_ids)
    GROUP BY c.core_library_id
  )
  SELECT
    l.id,
    l.name,
    COALESCE(la.total_quantity::INT, NULL) as stock,
    COALESCE(la.total_value::NUMERIC(10,2), NULL) as total_value
  FROM core_libraries l
  LEFT JOIN library_aggregates la ON la.library_id = l.id
  WHERE l.id = ANY(p_library_ids)
    AND (
      CASE p_stock_filter
        WHEN 'in-stock' THEN la.total_quantity > 0
        WHEN 'out-of-stock' THEN la.card_count > 0 AND COALESCE(la.total_quantity, 0) = 0
        ELSE la.card_count > 0
      END
    )
  ORDER BY l.name
  OFFSET p_offset
  LIMIT COALESCE(p_limit, NULL);
END;
$$;

-- ============================================================================
-- OPTIMIZED: get_user_sets_with_stock (FIXED for NULL library_id)
-- ============================================================================

CREATE FUNCTION get_user_sets_with_stock(
  p_library_id uuid,
  p_user_id uuid,
  p_stock_filter text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL,
  p_marketplace_filter text DEFAULT 'all'
)
RETURNS TABLE (
  id uuid,
  name character varying(200),
  stock integer,
  is_upcoming boolean,
  total_value numeric(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_stock AS (
    SELECT
      ucs.id as stock_id,
      ucs.core_card_id,
      ucs.quantity
    FROM user_card_stock ucs
    WHERE ucs.user_id = p_user_id
      AND ucs.is_active = TRUE
  ),
  stock_listings AS (
    SELECT DISTINCT
      usl.stock_id,
      m.name as marketplace_name
    FROM user_stock_listings usl
    JOIN marketplaces m ON m.id = usl.marketplace_id
    WHERE EXISTS (
      SELECT 1 FROM user_stock us
      WHERE us.stock_id = usl.stock_id
    )
  ),
  filtered_stock AS (
    SELECT
      us.stock_id,
      us.core_card_id,
      us.quantity
    FROM user_stock us
    WHERE
      CASE p_marketplace_filter
        WHEN 'all' THEN TRUE
        WHEN 'not-listed' THEN
          NOT EXISTS (
            SELECT 1 FROM stock_listings sl
            WHERE sl.stock_id = us.stock_id
          )
        ELSE EXISTS (
          SELECT 1 FROM stock_listings sl
          WHERE sl.stock_id = us.stock_id
            AND sl.marketplace_name = p_marketplace_filter
        )
      END
  ),
  set_aggregates AS (
    SELECT
      c.core_set_id as set_id,
      COUNT(DISTINCT c.id) as card_count,
      SUM(fs.quantity) as total_quantity,
      SUM(fs.quantity * COALESCE(ccp.tcgplayer_price, 0)) as total_value
    FROM filtered_stock fs
    JOIN core_cards c ON c.id = fs.core_card_id
    LEFT JOIN core_card_prices ccp ON ccp.core_card_id = c.id
    -- FIX: Handle NULL library_id to support "all sets" view
    WHERE (p_library_id IS NULL OR c.core_library_id = p_library_id)
    GROUP BY c.core_set_id
  )
  SELECT
    s.id,
    s.name,
    COALESCE(sa.total_quantity::INT, NULL) as stock,
    (s.release_date > CURRENT_DATE) as is_upcoming,
    COALESCE(sa.total_value::NUMERIC(10,2), NULL) as total_value
  FROM core_sets s
  LEFT JOIN set_aggregates sa ON sa.set_id = s.id
  -- FIX: Handle NULL library_id to support "all sets" view
  WHERE (p_library_id IS NULL OR s.core_library_id = p_library_id)
    AND (
      CASE p_stock_filter
        WHEN 'in-stock' THEN sa.total_quantity > 0
        WHEN 'out-of-stock' THEN sa.card_count > 0 AND COALESCE(sa.total_quantity, 0) = 0
        ELSE sa.card_count > 0
      END
    )
  ORDER BY s.name
  OFFSET p_offset
  LIMIT COALESCE(p_limit, NULL);
END;
$$;

-- ============================================================================
-- OPTIMIZED: get_user_cards_with_stock
-- ============================================================================

CREATE FUNCTION get_user_cards_with_stock(
  p_user_id uuid,
  p_library_id uuid DEFAULT NULL,
  p_set_id uuid DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL,
  p_stock_filter text DEFAULT 'all',
  p_sort_by text DEFAULT 'collector_number',
  p_marketplace_filter text DEFAULT 'all'
)
RETURNS TABLE (
  id uuid,
  name character varying(300),
  tcgplayer_id text,
  image_url text,
  rarity character varying(100),
  collector_number character varying(50),
  stock integer,
  tcgplayer_price numeric,
  core_set_name character varying(200),
  core_library_name character varying(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_stock AS (
    SELECT
      ucs.id as stock_id,
      ucs.core_card_id,
      ucs.quantity
    FROM user_card_stock ucs
    WHERE ucs.user_id = p_user_id
      AND ucs.is_active = TRUE
  ),
  stock_listings AS (
    SELECT DISTINCT
      usl.stock_id,
      m.name as marketplace_name
    FROM user_stock_listings usl
    JOIN marketplaces m ON m.id = usl.marketplace_id
    WHERE EXISTS (
      SELECT 1 FROM user_stock us
      WHERE us.stock_id = usl.stock_id
    )
  ),
  filtered_stock AS (
    SELECT
      us.stock_id,
      us.core_card_id,
      us.quantity
    FROM user_stock us
    WHERE
      CASE p_marketplace_filter
        WHEN 'all' THEN TRUE
        WHEN 'not-listed' THEN
          NOT EXISTS (
            SELECT 1 FROM stock_listings sl
            WHERE sl.stock_id = us.stock_id
          )
        ELSE EXISTS (
          SELECT 1 FROM stock_listings sl
          WHERE sl.stock_id = us.stock_id
            AND sl.marketplace_name = p_marketplace_filter
        )
      END
  ),
  card_aggregates AS (
    SELECT
      fs.core_card_id,
      SUM(fs.quantity) as total_quantity
    FROM filtered_stock fs
    GROUP BY fs.core_card_id
  )
  SELECT
    c.id,
    c.name,
    c.tcgplayer_id,
    c.image_url,
    c.rarity,
    c.collector_number,
    ca.total_quantity::INT as stock,
    ccp.tcgplayer_price,
    cs.name as core_set_name,
    cl.name as core_library_name
  FROM card_aggregates ca
  JOIN core_cards c ON c.id = ca.core_card_id
  JOIN core_sets cs ON cs.id = c.core_set_id
  JOIN core_libraries cl ON cl.id = c.core_library_id
  LEFT JOIN core_card_prices ccp ON ccp.core_card_id = c.id
  WHERE
    (p_library_id IS NULL OR c.core_library_id = p_library_id)
    AND (p_set_id IS NULL OR c.core_set_id = p_set_id)
    AND (
      p_search_query IS NULL
      OR c.name ILIKE '%' || p_search_query || '%'
      OR c.collector_number ILIKE '%' || p_search_query || '%'
    )
    AND cl.status = 'active'
    AND (
      CASE p_stock_filter
        WHEN 'in-stock' THEN ca.total_quantity > 0
        WHEN 'out-of-stock' THEN COALESCE(ca.total_quantity, 0) = 0
        ELSE TRUE
      END
    )
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

-- ============================================================================
-- ANALYZE TABLES (Update statistics for query planner)
-- ============================================================================
ANALYZE user_card_stock;
ANALYZE user_stock_listings;
ANALYZE core_cards;
ANALYZE core_card_prices;
ANALYZE marketplaces;
