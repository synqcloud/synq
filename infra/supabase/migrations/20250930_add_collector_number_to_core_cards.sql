-- Migration: Add collector_number column and update uniqueness constraint

-- Add collector_number column if it doesn't exist
ALTER TABLE public.core_cards
ADD COLUMN IF NOT EXISTS collector_number CHARACTER VARYING(50) NULL;

-- Drop the old unique constraint
ALTER TABLE public.core_cards
DROP CONSTRAINT IF EXISTS core_cards_core_library_id_core_set_id_name_key;

-- Add new unique constraint that includes collector_number
ALTER TABLE public.core_cards
ADD CONSTRAINT core_cards_core_library_id_core_set_id_name_collector_number_key
UNIQUE (core_library_id, core_set_id, name, collector_number);

-- Add index for collector_number searches
CREATE INDEX IF NOT EXISTS idx_core_cards_collector_number
ON public.core_cards USING btree (collector_number)
TABLESPACE pg_default;

-- Drop the existing function before recreating with new return type
DROP FUNCTION IF EXISTS public.get_user_cards_with_stock(UUID, UUID, TEXT, INT, INT, TEXT);

-- Create function with collector_number in results, search, and ordering
CREATE FUNCTION public.get_user_cards_with_stock(
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
