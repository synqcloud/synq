-- Migration: Add total_value field to get_user_sets and get_user_libraries functions
-- Created: 2025-10-09

-- =============================================
-- Drop existing functions
-- =============================================

DROP FUNCTION IF EXISTS public.get_user_sets_with_stock(UUID, UUID, INT, INT, TEXT);
DROP FUNCTION IF EXISTS public.get_user_libraries_with_stock(UUID, UUID[], INT, INT, TEXT);

-- =============================================
-- Recreate get_user_sets with total_value
-- =============================================

CREATE OR REPLACE FUNCTION get_user_sets_with_stock(
  p_library_id uuid,
  p_user_id uuid,
  p_stock_filter text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name character varying,  -- Match the original type from core_sets table
  stock integer,
  is_upcoming boolean,
  total_value numeric(10,2)
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
      (s.release_date > CURRENT_DATE) AS is_upcoming,
      SUM(COALESCE(ucs.quantity, 0) * COALESCE(ccp.tcgplayer_price, 0))::NUMERIC(10,2) AS total_value
  FROM core_sets s
  LEFT JOIN core_cards c ON c.core_set_id = s.id
  LEFT JOIN user_card_stock ucs
         ON ucs.core_card_id = c.id
        AND ucs.user_id      = p_user_id
        AND ucs.is_active    = TRUE
  LEFT JOIN core_card_prices ccp
         ON ccp.core_card_id = c.id
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
                AND u2.is_active    = TRUE
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

-- =============================================
-- Recreate get_user_libraries with total_value
-- =============================================

CREATE OR REPLACE FUNCTION get_user_libraries_with_stock(
  p_library_ids uuid[],
  p_user_id uuid,
  p_stock_filter text DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name character varying,  -- Match the original type from core_libraries table
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
  WHERE l.id = ANY (p_library_ids)
  GROUP BY l.id, l.name
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
                AND u2.is_active    = TRUE
          WHERE c2.core_library_id = l.id
          GROUP BY c2.id
          HAVING COUNT(u2.id) > 0 AND SUM(COALESCE(u2.quantity, 0)) = 0
        )
      ELSE TRUE
    END
  ORDER BY l.name
  OFFSET p_offset
  LIMIT  COALESCE(p_limit, NULL);
END;
$$;
