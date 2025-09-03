-- Seed: user stock updates (~500)
DO $$
DECLARE
    test_user_uuid UUID;
    stock_ids UUID[];
    stock_count INT;
    i INT;
    stock_id UUID;
    qty_change INT;
    update_type TEXT;
    note_text TEXT;
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

    stock_count := array_length(stock_ids, 1);

    IF stock_count IS NULL OR stock_count = 0 THEN
        RAISE EXCEPTION 'No stock found for the test user.';
    END IF;

    -- Generate ~500 stock updates
    FOR i IN 1..500 LOOP
        stock_id := stock_ids[floor(random()*stock_count + 1)];

        -- Random update type
        update_type := (ARRAY['add','remove','adjust'])[floor(random()*3 + 1)];

        -- Random quantity change: positive for 'add', negative for 'remove', +/- for 'adjust'
        IF update_type = 'add' THEN
            qty_change := floor(random()*10) + 1;
        ELSIF update_type = 'remove' THEN
            qty_change := -1 * (floor(random()*5) + 1);
        ELSE
            qty_change := (floor(random()*11) - 5); -- adjust -5 to +5
        END IF;

        -- Optional note
        note_text := 'Seeded stock update #' || i;

        INSERT INTO public.user_stock_updates (
            user_id,
            stock_id,
            update_type,
            quantity_change,
            note,
            created_at
        )
        VALUES (
            test_user_uuid,
            stock_id,
            update_type,
            qty_change,
            note_text,
            NOW() - (interval '1 day' * floor(random()*365))
        );
    END LOOP;

    RAISE NOTICE 'Successfully created 500 stock updates for user: %', test_user_uuid;
END $$;
