-- =============================================
-- Seed: large user stock (~5000 items)
-- =============================================
DO $$
DECLARE
    test_user_uuid UUID;
    core_card_count INT;
BEGIN
    -- Get test user
    SELECT id INTO test_user_uuid
    FROM auth.users
    WHERE email = 'test@synq.com';

    IF test_user_uuid IS NULL THEN
        RAISE EXCEPTION 'Test user not found. Run user seed first.';
    END IF;

    -- Count available core cards
    SELECT COUNT(*) INTO core_card_count
    FROM public.core_cards;

    IF core_card_count = 0 THEN
        RAISE EXCEPTION 'No core cards found. Seed core cards first.';
    END IF;

    -- Insert ~5000 stock items, distributing across core cards
    INSERT INTO public.user_card_stock (
        user_id,
        core_card_id,
        quantity,
        cogs,
        estimated_value,
        condition,
        grading,
        created_at,
        updated_at
    )
    SELECT
        test_user_uuid,
        id,
        floor(random()*5)+1,                -- quantity 1-5
        round((random()*100)::numeric,2),   -- cogs
        round((random()*200)::numeric,2),   -- estimated value
        (ARRAY['Near Mint','Mint','Good','Poor'])[floor(random()*4+1)],
        (ARRAY['Raw','PSA 10','PSA 9'])[floor(random()*3+1)],
        NOW(),
        NOW()
    FROM public.core_cards
    ORDER BY random()
    LIMIT 5000;
END $$;

-- =============================================
-- Seed user_card_listings for test user
-- =============================================
DO $$
DECLARE
    stock_rec RECORD;
    marketplaces TEXT[] := ARRAY['CardTrader','TCGplayer','eBay'];
    random_marketplace TEXT;
BEGIN
    FOR stock_rec IN
        SELECT id FROM public.user_card_stock
        WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@synq.com')
    LOOP
        -- Assign 1-2 random marketplaces for each stock item
        FOR i IN 1..(floor(random()*2)+1) LOOP
            random_marketplace := marketplaces[floor(random()*3 + 1)];

            -- Insert listing
            INSERT INTO public.user_card_listings (
                stock_id,
                marketplace,
                marketplace_listing_id,
                listed_quantity,
                listed_price,
                currency,
                created_at,
                updated_at
            )
            VALUES (
                stock_rec.id,
                random_marketplace::marketplace_type,
                md5(random()::text || clock_timestamp()::text), -- random listing ID
                floor(random()*5)+1,                              -- quantity 1-5
                round((random()*200)::numeric,2),                 -- price 0-200
                'USD',
                NOW(),
                NOW()
            )
            ON CONFLICT (stock_id, marketplace) DO NOTHING; -- evita duplicados
        END LOOP;
    END LOOP;
END $$;
