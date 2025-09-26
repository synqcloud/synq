-- Migration: 20250811_core_library_schema.sql
-- Description: Core Library schema for card shops
-- Tables: core_libraries, core_sets, core_cards, user_library_access

BEGIN;

-- =============================================
-- Core TCG Libraries (Master Data)
-- =============================================

CREATE TABLE IF NOT EXISTS public.core_libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('active', 'inactive')),
    -- TODO: ADD if supports prices

    external_source TEXT,               -- provider (p.ej. 'scryfall')
    external_id TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(external_source, external_id)
);

-- =============================================
-- Core TCG Sets (Sets within each TCG)
-- =============================================

CREATE TABLE IF NOT EXISTS public.core_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    core_library_id UUID NOT NULL REFERENCES public.core_libraries(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    release_date DATE,
    image_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()

);

-- =============================================
-- Core TCG Cards (Individual card definitions)
-- =============================================

CREATE TABLE IF NOT EXISTS public.core_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    core_library_id UUID NOT NULL REFERENCES public.core_libraries(id) ON DELETE CASCADE,
    core_set_id UUID NOT NULL REFERENCES public.core_sets(id) ON DELETE CASCADE,
    name VARCHAR(300) NOT NULL,
    rarity VARCHAR(100),
    image_url TEXT,

    external_source TEXT,               -- provider (p.ej. 'scryfall')
    external_id TEXT,
    tcgplayer_id TEXT,
    price_key TEXT,                     -- e.g. 'usd', 'usd_foil', 'eur_foil'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(core_library_id, core_set_id, name)  -- card name must be unique within each set only (Two sets can have the same card name)
);

-- =============================================
-- User Library Access (Access control)
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_library_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    core_library_id UUID NOT NULL REFERENCES public.core_libraries(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, core_library_id)
);


-- =============================================
-- Indexes for Performance
-- =============================================

-- Core libraries
CREATE INDEX IF NOT EXISTS idx_core_libraries_slug ON public.core_libraries(slug);

-- Core sets
CREATE INDEX IF NOT EXISTS idx_core_sets_library_id ON public.core_sets(core_library_id);
CREATE INDEX IF NOT EXISTS idx_core_sets_slug ON public.core_sets(slug);

-- Core cards
CREATE INDEX IF NOT EXISTS idx_core_cards_library_id ON public.core_cards(core_library_id);
CREATE INDEX IF NOT EXISTS idx_core_cards_set_id ON public.core_cards(core_set_id);
CREATE INDEX IF NOT EXISTS idx_core_cards_name ON public.core_cards(name);

-- User access
CREATE INDEX IF NOT EXISTS idx_user_library_access_user_id ON public.user_library_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_access_library_id ON public.user_library_access(core_library_id);


-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Core tables (public read access)
ALTER TABLE public.core_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_cards ENABLE ROW LEVEL SECURITY;

-- User-specific tables
ALTER TABLE public.user_library_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Core tables (anyone can read)
DROP POLICY IF EXISTS "Anyone can view core libraries" ON public.core_libraries;
CREATE POLICY "Anyone can view core libraries" ON public.core_libraries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view core sets" ON public.core_sets;
CREATE POLICY "Anyone can view core sets" ON public.core_sets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view core cards" ON public.core_cards;
CREATE POLICY "Anyone can view core cards" ON public.core_cards FOR SELECT USING (true);

-- RLS Policies: User library access
DROP POLICY IF EXISTS "Users can view their own library access" ON public.user_library_access;
CREATE POLICY "Users can view their own library access" ON public.user_library_access FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own library access" ON public.user_library_access;
CREATE POLICY "Users can manage their own library access" ON public.user_library_access FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- Triggers for updated_at
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_core_libraries_updated_at ON public.core_libraries;
CREATE TRIGGER update_core_libraries_updated_at BEFORE UPDATE ON public.core_libraries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_core_sets_updated_at ON public.core_sets;
CREATE TRIGGER update_core_sets_updated_at BEFORE UPDATE ON public.core_sets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_core_cards_updated_at ON public.core_cards;
CREATE TRIGGER update_core_cards_updated_at BEFORE UPDATE ON public.core_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_library_access_updated_at ON public.user_library_access;
CREATE TRIGGER update_user_library_access_updated_at BEFORE UPDATE ON public.user_library_access FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;
