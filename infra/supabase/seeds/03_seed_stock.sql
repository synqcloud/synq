-- =============================================
-- Seed: Marketplaces
-- =============================================
INSERT INTO public.marketplaces (name, created_at, updated_at)
VALUES
    ('TCGplayer', NOW(), NOW()),
    ('CardMarket', NOW(), NOW()),
    ('CardTrader', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- Seed: Large user stock (~5000 items)
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
-- Seed: user_stock_listings for test user
-- =============================================
DO $$
DECLARE
    stock_rec RECORD;
    marketplace_rec RECORD;
    marketplace_ids UUID[];
    selected_marketplace_id UUID;
    num_marketplaces INT;
BEGIN
    -- Get all marketplace IDs
    SELECT ARRAY(SELECT id FROM public.marketplaces ORDER BY name) INTO marketplace_ids;

    -- For each stock item, create listings on 1-2 random marketplaces
    FOR stock_rec IN
        SELECT id FROM public.user_card_stock
        WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@synq.com')
    LOOP
        -- Randomly choose how many marketplaces (1-2)
        num_marketplaces := floor(random()*2)+1;

        -- Create listings for random marketplaces
        FOR i IN 1..num_marketplaces LOOP
            -- Select a random marketplace
            selected_marketplace_id := marketplace_ids[floor(random()*array_length(marketplace_ids, 1))+1];

            -- Insert listing (using ON CONFLICT to avoid duplicates)
            INSERT INTO public.user_stock_listings (
                stock_id,
                marketplace_id,
                created_at,
                updated_at
            )
            VALUES (
                stock_rec.id,
                selected_marketplace_id,
                NOW(),
                NOW()
            )
            ON CONFLICT (stock_id, marketplace_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
