CREATE OR REPLACE FUNCTION public.get_user_price_alerts_batch(
  p_card_ids UUID[]
)
RETURNS TABLE(core_card_id UUID)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT core_card_id
  FROM public.user_card_price_alerts
  WHERE user_id = auth.uid()
    AND core_card_id = ANY(p_card_ids);
$$;
