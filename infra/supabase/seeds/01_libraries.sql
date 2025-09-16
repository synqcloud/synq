-- Seed: 01_libraries.sql
-- Description: Populate core libraries with sample data

-- =============================================
-- Core Libraries
-- =============================================

INSERT INTO public.core_libraries (id, name, slug, description, image_url, status) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Disney Lorcana',
    'disney-lorcana',
    'Disney Lorcana TCG collection and inventory tracking',
    'https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Pokémon TCG',
    'pokemon-tcg',
    'Pokémon Trading Card Game collection and inventory tracking',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png',
    'active'
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Yu-Gi-Oh!',
    'yu-gi-oh',
    'Yu-Gi-Oh! card collection and inventory management',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Yu-Gi-Oh%21_%28Logo%29.jpg/1200px-Yu-Gi-Oh%21_%28Logo%29.jpg',
    'inactive'
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'One Piece Card Game',
    'one-piece',
    'One Piece TCG collection and inventory management',
    'https://static.wixstatic.com/media/57a197_e334385962ac4203abe6390f3b6ff4c6~mv2.png/v1/fill/w_280,h_157,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/ONE%20PIECE%20LOGO.png',
    'inactive'
);

-- =============================================
-- Core TCG Sets
-- =============================================

-- Disney Lorcana Sets
INSERT INTO public.core_sets (id, core_library_id, name, slug, description, release_date, image_url) VALUES
(
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    'The First Chapter',
    'first-chapter',
    'The inaugural set featuring classic Disney characters',
    '2023-08-18',
    'https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png'
),
(
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001',
    'Rise of the Floodborn',
    'rise-of-the-floodborn',
    'The second set introducing new characters and mechanics',
    '2023-11-17',
    'https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png'
),
(
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440001',
    'Into the Inklands',
    'into-the-inklands',
    'The third set exploring new realms and adventures',
    '2024-02-23',
    'https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png'
);

-- Pokémon TCG Sets
INSERT INTO public.core_sets (id, core_library_id, name, slug, description, release_date, image_url) VALUES
(
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440002',
    'Base Set',
    'base-set',
    'The original Pokémon TCG set featuring classic Pokémon',
    '1999-01-09',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png'
),
(
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440002',
    'Scarlet & Violet',
    'scarlet-violet',
    'The latest generation of Pokémon cards',
    '2023-03-31',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png'
);

-- =============================================
-- Core TCG Cards
-- =============================================

-- Disney Lorcana Cards
INSERT INTO public.core_cards (id, core_library_id, core_set_id, name, rarity, image_url) VALUES
(
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011',
    'Mickey Mouse - Brave Little Tailor',
    'Legendary',
    'https://example.com/mickey-mouse-brave-little-tailor.jpg'
),
(
    '550e8400-e29b-41d4-a716-446655440102',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011',
    'Elsa - Snow Queen',
    'Super Rare',
    'https://example.com/elsa-snow-queen.jpg'
),
(
    '550e8400-e29b-41d4-a716-446655440103',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440012',
    'Belle - Strange but Special',
    'Legendary',
    'https://example.com/belle-strange-but-special.jpg'
);

-- Pokémon TCG Cards
INSERT INTO public.core_cards (id, core_library_id, core_set_id, name, rarity, image_url) VALUES
(
    '550e8400-e29b-41d4-a716-446655440201',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440021',
    'Charizard',
    'Holo Rare',
    'https://example.com/charizard.jpg'
),
(
    '550e8400-e29b-41d4-a716-446655440202',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440021',
    'Blastoise',
    'Holo Rare',
    'https://example.com/blastoise.jpg'
),
(
    '550e8400-e29b-41d4-a716-446655440203',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440022',
    'Pikachu',
    'Common',
    'https://example.com/pikachu.jpg'
);


-- Grant test user access to Pokémon TCG library
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get the test user ID from the temp table (created in user seeding)
    SELECT id INTO test_user_id FROM temp_users LIMIT 1;

    -- If temp table doesn't exist, try to find the user by email
    IF test_user_id IS NULL THEN
        SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@synq.com' LIMIT 1;
    END IF;

    -- Insert user library access if user found
    IF test_user_id IS NOT NULL THEN
        INSERT INTO public.user_library_access (user_id, core_library_id) VALUES
        (test_user_id, '550e8400-e29b-41d4-a716-446655440002'); -- Pokémon TCG

        RAISE NOTICE 'Granted test user access to Pokémon TCG library';
    ELSE
        RAISE WARNING 'Test user not found - could not grant library access';
    END IF;
END $$;
