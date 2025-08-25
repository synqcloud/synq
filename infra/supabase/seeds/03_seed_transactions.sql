-- Seed file: 03_seed_transactions.sql
-- Description: Seed stock and transactions for test@synq.com

DO $$
DECLARE
    test_user_uuid UUID;
    charizard_stock_id UUID;
    blastoise_stock_id UUID;
    pikachu_stock_id UUID;
    transaction_uuid UUID;
BEGIN
    -- Get the UUID of the test user
    SELECT id INTO test_user_uuid
    FROM auth.users
    WHERE email = 'test@synq.com';

    IF test_user_uuid IS NULL THEN
        RAISE EXCEPTION 'Test user not found. Please run the user seed first.';
    END IF;

    -- Insert Pokémon stock for the test user
    INSERT INTO public.user_card_stock (
        user_id, core_card_id, quantity, cogs, estimated_value, condition, grading, created_at, updated_at
    ) VALUES
        (test_user_uuid, '550e8400-e29b-41d4-a716-446655440201', 2, 50.00, 100.00, 'Near Mint', 'Raw', NOW(), NOW())
    RETURNING id INTO charizard_stock_id;

    INSERT INTO public.user_card_stock (
        user_id, core_card_id, quantity, cogs, estimated_value, condition, grading, created_at, updated_at
    ) VALUES
        (test_user_uuid, '550e8400-e29b-41d4-a716-446655440202', 3, 40.00, 80.00, 'Near Mint', 'Raw', NOW(), NOW())
    RETURNING id INTO blastoise_stock_id;

    INSERT INTO public.user_card_stock (
        user_id, core_card_id, quantity, cogs, estimated_value, condition, grading, created_at, updated_at
    ) VALUES
        (test_user_uuid, '550e8400-e29b-41d4-a716-446655440203', 5, 10.00, 20.00, 'Near Mint', 'Raw', NOW(), NOW())
    RETURNING id INTO pikachu_stock_id;

    -- Insert a SALE transaction for Charizard
    INSERT INTO public.user_transactions (
        user_id, transaction_type, performed_by, source, net_amount, created_at
    ) VALUES (
        test_user_uuid, 'SALE', test_user_uuid, 'in-store', 100.00, NOW()
    ) RETURNING id INTO transaction_uuid;

    INSERT INTO public.user_transaction_items (
        transaction_id, stock_id, quantity, unit_price, created_at
    ) VALUES (
        transaction_uuid, charizard_stock_id, 1, 100.00, NOW()
    );

    -- Insert a SALE transaction for Blastoise
    INSERT INTO public.user_transactions (
        user_id, transaction_type, performed_by, source, net_amount, created_at
    ) VALUES (
        test_user_uuid, 'SALE', test_user_uuid, 'in-store', 80.00, NOW()
    ) RETURNING id INTO transaction_uuid;

    INSERT INTO public.user_transaction_items (
        transaction_id, stock_id, quantity, unit_price, created_at
    ) VALUES (
        transaction_uuid, blastoise_stock_id, 1, 80.00, NOW()
    );

    -- Insert a PURCHASE transaction for Pikachu
    INSERT INTO public.user_transactions (
        user_id, transaction_type, performed_by, source, net_amount, created_at
    ) VALUES (
        test_user_uuid, 'PURCHASE', test_user_uuid, 'vendor', 50.00, NOW()
    ) RETURNING id INTO transaction_uuid;

    INSERT INTO public.user_transaction_items (
        transaction_id, stock_id, quantity, unit_price, created_at
    ) VALUES (
        transaction_uuid, pikachu_stock_id, 2, 25.00, NOW()
    );

END $$;
