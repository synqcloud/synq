-- Migration: 20250918_alter_get_card_stock_return.sql
-- Purpose: Re-create public.get_card_stock with updated return type (adds marketplaces text[])
-- Reason: Postgres does not allow changing a function's return type with CREATE OR REPLACE; must DROP and CREATE

BEGIN;

-- Safely drop the existing function with its exact signature if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'get_card_stock'
      AND pg_get_function_identity_arguments(p.oid) = 'p_user_id uuid, p_core_card_id uuid'
  ) THEN
    EXECUTE 'DROP FUNCTION public.get_card_stock(UUID, UUID)';
  END IF;
END$$;

-- Recreate function with updated return type including marketplaces text[]
CREATE OR REPLACE FUNCTION public.get_card_stock(
    p_user_id UUID,
    p_core_card_id UUID DEFAULT NULL
)
RETURNS TABLE(
    stock_id UUID,
    core_card_id UUID,
    card_name TEXT,
    set_name TEXT,
    library_name TEXT,
    quantity INTEGER,
    condition TEXT,
    language TEXT,
    cogs NUMERIC,
    location TEXT,
    marketplaces TEXT[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ucs.id AS stock_id,
        ucs.core_card_id,
        cc.name::TEXT AS card_name,
        cs.name::TEXT AS set_name,
        cl.name::TEXT AS library_name,
        ucs.quantity,
        ucs.condition::TEXT AS condition,
        ucs.language::TEXT AS language,
        -- Handle cogs array if it exists; take first element or sum, depending on your logic
        -- Option 1: If cogs is a single number stored as string
        ucs.cogs::NUMERIC AS cogs
        -- Option 2: If cogs is a VARCHAR[] and you want sum as NUMERIC
        -- (SELECT SUM(x::NUMERIC) FROM unnest(ucs.cogs) AS x) AS cogs
        ,
        ucs.location::TEXT AS location,
        (
          SELECT COALESCE(array_agg(DISTINCT m.name::text), '{}'::text[])
          FROM public.user_stock_listings usl
          JOIN public.marketplaces m ON m.id = usl.marketplace_id
          WHERE usl.stock_id = ucs.id
        ) AS marketplaces
    FROM public.user_card_stock ucs
    JOIN public.core_cards cc ON ucs.core_card_id = cc.id
    JOIN public.core_sets cs ON cc.core_set_id = cs.id
    JOIN public.core_libraries cl ON cc.core_library_id = cl.id
    WHERE ucs.user_id = p_user_id
      AND ucs.is_active = TRUE
      AND (p_core_card_id IS NULL OR ucs.core_card_id = p_core_card_id)
    ORDER BY cc.name, ucs.condition, ucs.language;
END;
$$;

COMMIT;
