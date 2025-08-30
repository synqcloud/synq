-- Seed: large user transactions (~5,000) with multiple marketplaces
DO $$
DECLARE
    test_user_uuid UUID;
    stock_ids UUID[];
    stock_count INT;
    transaction_uuid UUID;
    i INT;
    item_count INT;
    tx_type transaction_type;
    stock_id UUID;
    max_qty INT;
    qty INT;
    tx_source TEXT;
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
    FOR i IN 1..3000 LOOP
        tx_type := 'BUY';
        tx_source := (ARRAY['in-store','eBay','Whatnot','CardMarket','TCGplayer','CardTrader'])[floor(random()*6+1)];

        INSERT INTO public.user_transactions (
            user_id,
            transaction_type,
            performed_by,
            source,
            net_amount,
            created_at,
            is_integration
        )
        VALUES (
            test_user_uuid,
            tx_type,
            test_user_uuid,
            tx_source,
            0,
            NOW() - (interval '1 day' * floor(random()*365)),
            (tx_source = 'CardTrader')  -- only CardTrader = integration
        )
        RETURNING id INTO transaction_uuid;

        FOR item_count IN 1..(floor(random()*3)+1) LOOP
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

        UPDATE public.user_transactions
        SET net_amount = (
            SELECT SUM(quantity * unit_price)
            FROM public.user_transaction_items
            WHERE transaction_id = transaction_uuid
        )
        WHERE id = transaction_uuid;
    END LOOP;

    -- Phase 2: Mixed transactions (~2,000)
    FOR i IN 1..2000 LOOP
        tx_type := (ARRAY['SELL','STOCK_MOVEMENT','MARKETPLACE_LISTING']::transaction_type[])[floor(random()*3+1)];
        tx_source := (ARRAY['in-store','eBay','Whatnot','CardMarket','TCGplayer','CardTrader'])[floor(random()*6+1)];

        INSERT INTO public.user_transactions (
            user_id,
            transaction_type,
            performed_by,
            source,
            net_amount,
            created_at,
            is_integration
        )
        VALUES (
            test_user_uuid,
            tx_type,
            test_user_uuid,
            tx_source,
            0,
            NOW() - (interval '1 day' * floor(random()*365)),
            (tx_source = 'CardTrader')
        )
        RETURNING id INTO transaction_uuid;

        FOR item_count IN 1..(floor(random()*3)+1) LOOP
            stock_id := stock_ids[floor(random()*stock_count + 1)];

            IF tx_type = 'SELL' THEN
                SELECT quantity INTO max_qty
                FROM public.user_card_stock
                WHERE id = stock_id;

                IF max_qty = 0 THEN
                    CONTINUE;
                END IF;

                qty := LEAST(floor(random()*5)+1, max_qty);
            ELSE
                qty := floor(random()*5)+1;
            END IF;

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

        UPDATE public.user_transactions
        SET net_amount = (
            SELECT SUM(quantity * unit_price)
            FROM public.user_transaction_items
            WHERE transaction_id = transaction_uuid
        )
        WHERE id = transaction_uuid;
    END LOOP;
END $$;
