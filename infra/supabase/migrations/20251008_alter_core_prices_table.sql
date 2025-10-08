ALTER TABLE public.core_card_prices
ADD COLUMN previous_tcgplayer_price DECIMAL(10,2),
ADD COLUMN previous_cardmarket_price DECIMAL(10,2)
