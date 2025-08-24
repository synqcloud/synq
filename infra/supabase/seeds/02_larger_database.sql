-- Seed: 02_large_dataset.sql
-- Description: Generate ~5000 cards across Disney Lorcana and Pokémon TCG for development

-- =============================================
-- Disney Lorcana Additional Sets
-- =============================================

INSERT INTO public.core_sets (id, core_library_id, name, slug, description, release_date, image_url) VALUES
-- Additional Disney Lorcana Sets
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'Ursula''s Return', 'ursulas-return', 'Fourth set featuring Ursula and sea-themed characters', '2024-05-17', 'https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png'),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', 'Shimmering Skies', 'shimmering-skies', 'Fifth set with aerial adventures and sky themes', '2024-08-09', 'https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png'),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440001', 'Azurite Sea', 'azurite-sea', 'Sixth set exploring oceanic depths and mysteries', '2024-11-15', 'https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png'),
('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440001', 'Gateway', 'gateway', 'Seventh set opening new dimensional pathways', '2025-02-28', 'https://wiki.mushureport.com/images/thumb/5/57/Disney_Lorcana_TCG_Logo_transparent.png/1200px-Disney_Lorcana_TCG_Logo_transparent.png');

-- =============================================
-- Pokémon TCG Additional Sets
-- =============================================

INSERT INTO public.core_sets (id, core_library_id, name, slug, description, release_date, image_url) VALUES
-- Classic Pokémon Sets
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', 'Jungle', 'jungle', 'Second Pokémon TCG set featuring jungle Pokémon', '1999-06-16', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png'),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440002', 'Fossil', 'fossil', 'Third set introducing ancient Pokémon', '1999-10-10', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png'),
('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440002', 'Team Rocket', 'team-rocket', 'Featuring dark Pokémon and Team Rocket themes', '2000-04-24', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png'),
-- Modern Pokémon Sets
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440002', 'Paldeal Fates', 'paldeal-fates', 'Special set with Paldean regional variants', '2024-01-26', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png'),
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440002', 'Temporal Forces', 'temporal-forces', 'Time-themed set with past and future Pokémon', '2024-03-22', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png'),
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440002', 'Twilight Masquerade', 'twilight-masquerade', 'Mysterious set with mask-themed Pokémon', '2024-05-24', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png'),
('550e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440002', 'Shrouded Fable', 'shrouded-fable', 'Mythical Pokémon focused expansion', '2024-08-02', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png'),
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440002', 'Stellar Crown', 'stellar-crown', 'Stellar-type Pokémon debut set', '2024-09-13', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pok%C3%A9mon_Trading_Card_Game_logo.svg/2560px-Pok%C3%A9mon_Trading_Card_Game_logo.svg.png');

-- =============================================
-- Disney Lorcana Card Generation (2500 cards)
-- =============================================

-- Disney Characters for Lorcana
WITH disney_characters AS (
    SELECT unnest(ARRAY[
        'Mickey Mouse', 'Minnie Mouse', 'Donald Duck', 'Daisy Duck', 'Goofy', 'Pluto',
        'Elsa', 'Anna', 'Olaf', 'Kristoff', 'Sven', 'Hans',
        'Belle', 'Beast', 'Lumiere', 'Cogsworth', 'Mrs. Potts', 'Chip',
        'Ariel', 'Eric', 'Sebastian', 'Flounder', 'Ursula', 'King Triton',
        'Simba', 'Nala', 'Timon', 'Pumbaa', 'Mufasa', 'Scar',
        'Aladdin', 'Jasmine', 'Genie', 'Jafar', 'Abu', 'Carpet',
        'Moana', 'Maui', 'Grandmother Tala', 'Chief Tui', 'Hei Hei', 'Pua',
        'Rapunzel', 'Flynn Rider', 'Mother Gothel', 'Pascal', 'Maximus',
        'Tiana', 'Prince Naveen', 'Louis', 'Ray', 'Dr. Facilier',
        'Mulan', 'Li Shang', 'Mushu', 'Cricket', 'Shan Yu',
        'Pocahontas', 'John Smith', 'Meeko', 'Flit', 'Governor Ratcliffe',
        'Cinderella', 'Prince Charming', 'Fairy Godmother', 'Jaq', 'Gus',
        'Snow White', 'Prince', 'Happy', 'Grumpy', 'Sleepy', 'Sneezy', 'Bashful', 'Dopey', 'Doc',
        'Aurora', 'Prince Philip', 'Flora', 'Fauna', 'Merryweather', 'Maleficent',
        'Stitch', 'Lilo', 'Nani', 'Jumba', 'Pleakley', 'Gantu',
        'Woody', 'Buzz Lightyear', 'Jessie', 'Rex', 'Hamm', 'Slinky Dog',
        'Sulley', 'Mike', 'Boo', 'Randall', 'Celia', 'Roz',
        'Nemo', 'Marlin', 'Dory', 'Bruce', 'Crush', 'Squirt',
        'Lightning McQueen', 'Mater', 'Sally', 'Doc Hudson', 'Chick Hicks',
        'WALL-E', 'EVE', 'Auto', 'Captain', 'M-O',
        'Remy', 'Linguini', 'Colette', 'Skinner', 'Anton Ego',
        'Carl', 'Russell', 'Dug', 'Kevin', 'Charles Muntz',
        'Merida', 'Queen Elinor', 'King Fergus', 'Angus', 'Mor''du',
        'Joy', 'Sadness', 'Anger', 'Fear', 'Disgust', 'Riley',
        'Judy Hopps', 'Nick Wilde', 'Chief Bogo', 'Flash', 'Bellwether',
        'Hector', 'Miguel', 'Ernesto', 'Mama Coco', 'Dante',
        'Ian', 'Barley', 'Laurel', 'Wilden', 'Corey',
        'Joe Gardner', 'Soul 22', 'Dorothea', 'Moonwind', 'Terry',
        'Luca', 'Alberto', 'Giulia', 'Ercole', 'Massimo',
        'Mei Lee', 'Ming', 'Jin', 'Grandma Wu', 'Red Panda'
    ]) AS character_name
),
lorcana_variants AS (
    SELECT unnest(ARRAY[
        'Brave Little Tailor', 'Sorcerer''s Apprentice', 'Musketeer',
        'Snow Queen', 'Spirit of Winter', 'Queen of Arendelle',
        'Strange but Special', 'Accomplished Mystic', 'Bookworm',
        'On Human Legs', 'Spectacular Singer', 'Mermaid Princess',
        'King of Beasts', 'Rightful Heir', 'Cub',
        'Street Rat', 'Prince Ali', 'Hero of Agrabah',
        'Of Motunui', 'Courageous Navigator', 'Daughter of the Chief',
        'Lost Princess', 'Tower Girl', 'Free Spirit',
        'Ambitious Dreamer', 'Frog Princess', 'Accomplished Cook',
        'Imperial Soldier', 'Reflected Glory', 'Fa Mulan',
        'Free Spirit', 'Compass of the Heart', 'Daughter of Chief Powhatan',
        'Gentle and Kind', 'Beloved Daughter', 'Pure Heart',
        'Dreaming Guardian', 'Briar Rose', 'Sleeping Beauty',
        'Alien Experiment', 'Carefree Surfer', 'Experiment 626',
        'Sheriff', 'Space Ranger', 'Legendary Outlaw',
        'Top Scarer', 'Laugh Expert', 'Scare Student',
        'Adventurous Fish', 'Overprotective Father', 'Forgetful Fish',
        'Speed', 'Famous Race Car', 'Rookie Racer',
        'Persistent Robot', 'Plant Boot', 'Axiom''s Directive',
        'Great Mouse Detective', 'Little Chef', 'Anyone Can Cook',
        'Senior Wilderness Explorer', 'Dug''s Best Friend', 'Retired Balloon Salesman',
        'Unruly', 'Bear Princess', 'Skilled Archer',
        'So Positive', 'Cooperative Friend', 'Core Memory',
        'Optimistic Officer', 'Sly Fox', 'Small Mammal Cop',
        'Great Great Grandson', 'Aspiring Musician', 'Family First',
        'Manticore Tavern', 'Quests of Yore', 'The Manticore',
        'Talented Musician', 'Middle School Band Teacher', 'Born to Play',
        'Sea Monster Kid', 'Just Alberto', 'Local Catch',
        'Red Panda Girl', '4*Town Fan', 'Panda Power'
    ]) AS variant_name
),
lorcana_rarities AS (
    SELECT unnest(ARRAY['Common', 'Uncommon', 'Rare', 'Super Rare', 'Legendary', 'Enchanted']) AS rarity,
           unnest(ARRAY[50, 30, 15, 3, 1.5, 0.5]) AS weight
),
lorcana_sets AS (
    SELECT id::uuid, name FROM (VALUES
        ('550e8400-e29b-41d4-a716-446655440011', 'The First Chapter'),
        ('550e8400-e29b-41d4-a716-446655440012', 'Rise of the Floodborn'),
        ('550e8400-e29b-41d4-a716-446655440013', 'Into the Inklands'),
        ('550e8400-e29b-41d4-a716-446655440014', 'Ursula''s Return'),
        ('550e8400-e29b-41d4-a716-446655440015', 'Shimmering Skies'),
        ('550e8400-e29b-41d4-a716-446655440016', 'Azurite Sea'),
        ('550e8400-e29b-41d4-a716-446655440017', 'Gateway')
    ) AS sets(id, name)
),
-- Generate card combinations
lorcana_card_data AS (
    SELECT
        ('550e8400-e29b-41d4-a716-4466554' || LPAD((40400 + ROW_NUMBER() OVER(ORDER BY core_set_id, name))::text, 5, '0'))::uuid AS id,
        core_library_id,
        core_set_id,
        name,
        rarity,
        image_url
    FROM (
        SELECT DISTINCT ON (core_set_id, character_name, variant_name)
            '550e8400-e29b-41d4-a716-446655440001'::uuid AS core_library_id,
            s.id AS core_set_id,
            (c.character_name || ' - ' || v.variant_name || ' (' || s.name || ')') AS name,
            r.rarity,
            ('https://example.com/lorcana/' || LOWER(REPLACE(REPLACE(c.character_name || '-' || v.variant_name, ' ', '-'), '''', '')) || '.jpg') AS image_url,
            c.character_name,
            v.variant_name,
            (ABS(HASHTEXT(c.character_name || v.variant_name || s.name || r.rarity)) % 100) as hash_val
        FROM disney_characters c
        CROSS JOIN lorcana_variants v
        CROSS JOIN lorcana_sets s
        CROSS JOIN lorcana_rarities r
        WHERE (ABS(HASHTEXT(c.character_name || v.variant_name || s.name || r.rarity)) % 100) < (r.weight * 2)
        ORDER BY core_set_id, character_name, variant_name, hash_val
    ) deduplicated
)
INSERT INTO public.core_cards (id, core_library_id, core_set_id, name, rarity, image_url)
SELECT id, core_library_id, core_set_id, name, rarity, image_url
FROM lorcana_card_data
LIMIT 2500;

-- =============================================
-- Pokémon TCG Card Generation (2500 cards)
-- =============================================

-- Pokémon names and types
WITH pokemon_names AS (
    SELECT unnest(ARRAY[
        'Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon', 'Charizard',
        'Squirtle', 'Wartortle', 'Blastoise', 'Caterpie', 'Metapod', 'Butterfree',
        'Weedle', 'Kakuna', 'Beedrill', 'Pidgey', 'Pidgeotto', 'Pidgeot',
        'Rattata', 'Raticate', 'Spearow', 'Fearow', 'Ekans', 'Arbok',
        'Pikachu', 'Raichu', 'Sandshrew', 'Sandslash', 'Nidoran♀', 'Nidorina',
        'Nidoqueen', 'Nidoran♂', 'Nidorino', 'Nidoking', 'Clefairy', 'Clefable',
        'Vulpix', 'Ninetales', 'Jigglypuff', 'Wigglytuff', 'Zubat', 'Golbat',
        'Oddish', 'Gloom', 'Vileplume', 'Paras', 'Parasect', 'Venonat',
        'Venomoth', 'Diglett', 'Dugtrio', 'Meowth', 'Persian', 'Psyduck',
        'Golduck', 'Mankey', 'Primeape', 'Growlithe', 'Arcanine', 'Poliwag',
        'Poliwhirl', 'Poliwrath', 'Abra', 'Kadabra', 'Alakazam', 'Machop',
        'Machoke', 'Machamp', 'Bellsprout', 'Weepinbell', 'Victreebel',
        'Tentacool', 'Tentacruel', 'Geodude', 'Graveler', 'Golem',
        'Ponyta', 'Rapidash', 'Slowpoke', 'Slowbro', 'Magnemite', 'Magneton',
        'Farfetch''d', 'Doduo', 'Dodrio', 'Seel', 'Dewgong', 'Grimer', 'Muk',
        'Shellder', 'Cloyster', 'Gastly', 'Haunter', 'Gengar', 'Onix',
        'Drowzee', 'Hypno', 'Krabby', 'Kingler', 'Voltorb', 'Electrode',
        'Exeggcute', 'Exeggutor', 'Cubone', 'Marowak', 'Hitmonlee', 'Hitmonchan',
        'Lickitung', 'Koffing', 'Weezing', 'Rhyhorn', 'Rhydon', 'Chansey',
        'Tangela', 'Kangaskhan', 'Horsea', 'Seadra', 'Goldeen', 'Seaking',
        'Staryu', 'Starmie', 'Mr. Mime', 'Scyther', 'Jynx', 'Electabuzz',
        'Magmar', 'Pinsir', 'Tauros', 'Magikarp', 'Gyarados', 'Lapras',
        'Ditto', 'Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Porygon',
        'Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Aerodactyl', 'Snorlax',
        'Articuno', 'Zapdos', 'Moltres', 'Dratini', 'Dragonair', 'Dragonite',
        'Mewtwo', 'Mew', 'Chikorita', 'Bayleef', 'Meganium', 'Cyndaquil',
        'Quilava', 'Typhlosion', 'Totodile', 'Croconaw', 'Feraligatr'
    ]) AS pokemon_name
),
pokemon_variants AS (
    SELECT unnest(ARRAY[
        '', 'ex', 'GX', 'V', 'VMAX', 'VSTAR', 'Prime', 'LEGEND', 'BREAK',
        'Shining', 'Crystal', 'δ (Delta Species)', 'SP', 'Team Plasma',
        'Team Aqua''s', 'Team Magma''s', 'Rocket''s', 'Giovanni''s', 'Brock''s',
        'Misty''s', 'Lt. Surge''s', 'Erika''s', 'Koga''s', 'Sabrina''s',
        'Blaine''s', 'Dark', 'Light', 'Shining', 'Amazing', 'Radiant'
    ]) AS variant
),
pokemon_rarities AS (
    SELECT unnest(ARRAY['Common', 'Uncommon', 'Rare', 'Holo Rare', 'Ultra Rare', 'Secret Rare']) AS rarity,
           unnest(ARRAY[40, 30, 20, 7, 2.5, 0.5]) AS weight
),
pokemon_sets AS (
    SELECT id::uuid, name FROM (VALUES
        ('550e8400-e29b-41d4-a716-446655440021', 'Base Set'),
        ('550e8400-e29b-41d4-a716-446655440022', 'Scarlet & Violet'),
        ('550e8400-e29b-41d4-a716-446655440023', 'Jungle'),
        ('550e8400-e29b-41d4-a716-446655440024', 'Fossil'),
        ('550e8400-e29b-41d4-a716-446655440025', 'Team Rocket'),
        ('550e8400-e29b-41d4-a716-446655440026', 'Paldeal Fates'),
        ('550e8400-e29b-41d4-a716-446655440027', 'Temporal Forces'),
        ('550e8400-e29b-41d4-a716-446655440028', 'Twilight Masquerade'),
        ('550e8400-e29b-41d4-a716-446655440029', 'Shrouded Fable'),
        ('550e8400-e29b-41d4-a716-446655440030', 'Stellar Crown')
    ) AS sets(id, name)
),
-- Generate Pokémon card combinations
pokemon_card_data AS (
    SELECT
        ('550e8400-e29b-41d4-a716-4466554' || LPAD((50400 + ROW_NUMBER() OVER(ORDER BY core_set_id, name))::text, 5, '0'))::uuid AS id,
        core_library_id,
        core_set_id,
        name,
        rarity,
        image_url
    FROM (
        SELECT DISTINCT ON (core_set_id, pokemon_name, variant)
            '550e8400-e29b-41d4-a716-446655440002'::uuid AS core_library_id,
            s.id AS core_set_id,
            CASE
                WHEN v.variant = '' THEN p.pokemon_name || ' (' || s.name || ')'
                ELSE p.pokemon_name || ' ' || v.variant || ' (' || s.name || ')'
            END AS name,
            r.rarity,
            ('https://example.com/pokemon/' || LOWER(REPLACE(REPLACE(p.pokemon_name || CASE WHEN v.variant = '' THEN '' ELSE '-' || v.variant END, ' ', '-'), '''', '')) || '.jpg') AS image_url,
            p.pokemon_name,
            v.variant,
            (ABS(HASHTEXT(p.pokemon_name || v.variant || s.name || r.rarity)) % 100) as hash_val
        FROM pokemon_names p
        CROSS JOIN pokemon_variants v
        CROSS JOIN pokemon_sets s
        CROSS JOIN pokemon_rarities r
        WHERE (ABS(HASHTEXT(p.pokemon_name || v.variant || s.name || r.rarity)) % 100) < (r.weight * 2)
          AND NOT (v.variant IN ('ex', 'GX', 'V', 'VMAX', 'VSTAR') AND s.name IN ('Base Set', 'Jungle', 'Fossil', 'Team Rocket'))
          AND NOT (v.variant IN ('Team Plasma', 'Team Aqua''s', 'Team Magma''s') AND s.name NOT LIKE '%Team%')
        ORDER BY core_set_id, pokemon_name, variant, hash_val
    ) deduplicated
)
INSERT INTO public.core_cards (id, core_library_id, core_set_id, name, rarity, image_url)
SELECT id, core_library_id, core_set_id, name, rarity, image_url
FROM pokemon_card_data
LIMIT 2500;

-- =============================================
-- Summary Statistics
-- =============================================

-- Generate summary report
DO $$
DECLARE
    disney_count INTEGER;
    pokemon_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO disney_count FROM core_cards WHERE core_library_id = '550e8400-e29b-41d4-a716-446655440001';
    SELECT COUNT(*) INTO pokemon_count FROM core_cards WHERE core_library_id = '550e8400-e29b-41d4-a716-446655440002';
    SELECT COUNT(*) INTO total_count FROM core_cards WHERE core_library_id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002');

    RAISE NOTICE '=== SEED DATA SUMMARY ===';
    RAISE NOTICE 'Disney Lorcana cards: %', disney_count;
    RAISE NOTICE 'Pokémon TCG cards: %', pokemon_count;
    RAISE NOTICE 'Total cards generated: %', total_count;
    RAISE NOTICE '========================';
END $$;
