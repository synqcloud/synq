DROP TABLE IF EXISTS public.user_integrations;

-- Simple integrations table
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  integration_type VARCHAR(50) NOT NULL, -- 'shopify', 'tcgplayer', 'cardmarket', etc.
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'paused', 'error'

  credentials JSONB NOT NULL DEFAULT '{}', -- Store all integration-specific data here

  last_synced_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate integrations per user
  UNIQUE(user_id, integration_type)
);

-- Index for lookups
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);

-- RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own integrations"
  ON user_integrations
  USING (auth.uid() = user_id);
