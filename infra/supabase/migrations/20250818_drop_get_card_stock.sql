-- Migration: 20250818_drop_get_card_stock.sql
-- Purpose: Pre-drop existing public.get_card_stock(UUID, UUID) to allow redefinition with new RETURN type in subsequent migration

BEGIN;

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

COMMIT;
