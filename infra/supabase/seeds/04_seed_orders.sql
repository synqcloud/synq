-- Seed: large user orders (~5,000) with multiple marketplaces
DO $$
DECLARE
    test_user_uuid UUID;
    stock_ids UUID[];
    stock_count INT;
    order_uuid UUID;
    i INT;
    item_count INT;
    order_stat order_status;
    stock_id UUID;
    max_qty INT;
    qty INT;
    order_source TEXT;
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

    -- Possible order sources
    -- CardTrader will be the only integration source

    -- Phase 1: Orders (~5,000 with mixed statuses)
    FOR i IN 1..5000 LOOP
        -- Random order status distribution: 10% pending, 30% in_progress, 60% completed
        order_stat := (ARRAY['PENDING','IN_PROGRESS','COMPLETED']::order_status[])[
            CASE
                WHEN random() < 0.1 THEN 1
                WHEN random() < 0.4 THEN 2
                ELSE 3
            END
        ];

        order_source := (ARRAY['in-store','eBay','Whatnot','CardMarket','TCGplayer','CardTrader'])[floor(random()*6+1)];

        INSERT INTO public.user_orders (
            user_id,
            order_status,
            performed_by,
            source,
            net_amount,
            created_at,
            is_integration
        )
        VALUES (
            test_user_uuid,
            order_stat,
            test_user_uuid,
            order_source,
            0,
            NOW() - (interval '1 day' * floor(random()*365)),
            (order_source = 'CardTrader')  -- only CardTrader = integration
        )
        RETURNING id INTO order_uuid;

        -- Random items per order (1-4 items)
        FOR item_count IN 1..(floor(random()*4)+1) LOOP
            stock_id := stock_ids[floor(random()*stock_count + 1)];
            qty := floor(random()*5)+1;

            INSERT INTO public.user_order_items (
                order_id,
                stock_id,
                quantity,
                unit_price,
                created_at
            )
            VALUES (
                order_uuid,
                stock_id,
                qty,
                round((random()*150)::numeric,2),
                NOW()
            );
        END LOOP;

        -- Update net amount based on order items
        UPDATE public.user_orders
        SET net_amount = (
            SELECT SUM(quantity * unit_price)
            FROM public.user_order_items
            WHERE order_id = order_uuid
        )
        WHERE id = order_uuid;
    END LOOP;

    RAISE NOTICE 'Successfully created 5,000 orders with items for user: %', test_user_uuid;
END $$;
