-- Seed: large user transactions (~5,000) with multiple marketplaces (Sale transactions only)
DO $$
DECLARE
    test_user_uuid UUID;
    stock_ids UUID[];
    stock_count INT;
    transaction_uuid UUID;
    i INT;
    item_count INT;
    trans_status transaction_status;
    trans_type transaction_type;
    stock_id UUID;
    max_qty INT;
    qty INT;
    transaction_source TEXT;
    subtotal NUMERIC(10,2);
    tax NUMERIC(10,2);
    shipping NUMERIC(10,2);
BEGIN
    -- Get test user UUID
    SELECT id INTO test_user_uuid
    FROM auth.users
    WHERE email = 'test@synq.com';
    IF test_user_uuid IS NULL THEN
        RAISE EXCEPTION 'Test user not found. Run user seed first.';
    END IF;

    -- Get all stock IDs for the user
    SELECT array_agg(id) INTO stock_ids
    FROM public.user_card_stock
    WHERE user_id = test_user_uuid;
    stock_count := array_length(stock_ids,1);
    IF stock_count IS NULL OR stock_count = 0 THEN
        RAISE EXCEPTION 'No stock found for the test user.';
    END IF;

    -- Possible transaction sources
    -- CardTrader will be the only integration source

    -- Phase 1: Transactions (~5,000 with mixed statuses, sale type only)
    FOR i IN 1..5000 LOOP
        -- Random transaction status distribution: 10% pending, 30% in_progress, 60% completed
        trans_status := (ARRAY['PENDING','IN_PROGRESS','COMPLETED']::transaction_status[])[
            CASE
                WHEN random() < 0.1 THEN 1
                WHEN random() < 0.4 THEN 2
                ELSE 3
            END
        ];

        -- Only sale transactions
        trans_type := 'sale';

        transaction_source := (ARRAY['in-store','eBay','Whatnot','CardMarket','TCGplayer','CardTrader'])[floor(random()*6+1)];

        INSERT INTO public.user_transaction (
            user_id,
            transaction_status,
            transaction_type,
            performed_by,
            source,
            subtotal_amount,
            tax_amount,
            shipping_amount,
            net_amount,
            created_at,
            is_integration
        )
        VALUES (
            test_user_uuid,
            trans_status,
            trans_type,
            test_user_uuid,
            transaction_source,
            0, -- Will be updated after items are added
            0, -- Will be calculated
            0, -- Will be calculated
            0, -- Will be calculated
            NOW() - (interval '1 day' * floor(random()*365)),
            (transaction_source = 'CardTrader')  -- only CardTrader = integration
        )
        RETURNING id INTO transaction_uuid;

        -- Random items per transaction (1-4 items)
        FOR item_count IN 1..(floor(random()*4)+1) LOOP
            stock_id := stock_ids[floor(random()*stock_count + 1)];
            qty := floor(random()*5)+1;

            INSERT INTO public.user_transaction_items (
                transaction_id,
                stock_id,
                quantity,
                unit_price,
                created_at
            )
            VALUES (
                transaction_uuid,
                stock_id,
                qty,
                round((random()*150)::numeric,2),
                NOW()
            );
        END LOOP;

        -- Calculate subtotal based on transaction items
        SELECT SUM(quantity * unit_price) INTO subtotal
        FROM public.user_transaction_items
        WHERE transaction_id = transaction_uuid;

        -- Calculate tax (8.5% for sales)
        tax := round((subtotal * 0.085)::numeric, 2);

        -- Calculate shipping (random $5-15 for sales)
        shipping := round((random() * 10 + 5)::numeric, 2);

        -- Update transaction with calculated amounts
        UPDATE public.user_transaction
        SET
            subtotal_amount = subtotal,
            tax_amount = tax,
            shipping_amount = shipping,
            net_amount = subtotal + tax + shipping
        WHERE id = transaction_uuid;

    END LOOP;

    RAISE NOTICE 'Successfully created 5,000 sale transactions with items for user: %', test_user_uuid;
END $$;
