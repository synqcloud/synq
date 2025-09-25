-- Simple subscription status enum
CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'canceled',
  'past_due'
);

-- Single subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status subscription_status DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_stripe_subscription_id_idx ON user_subscriptions(stripe_subscription_id);


-- Function to check if user has access
CREATE OR REPLACE FUNCTION public.user_has_access(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription RECORD;
BEGIN
  SELECT * INTO subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  IF subscription IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN subscription.status IN ('active', 'trialing')
    AND (subscription.trial_ends_at IS NULL OR subscription.trial_ends_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row-Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: users can select only their own subscriptions
CREATE POLICY user_select_own_subscriptions
ON user_subscriptions
FOR SELECT
USING (user_id = auth.uid());

-- Policy: users can update only their own subscriptions
CREATE POLICY user_update_own_subscriptions
ON user_subscriptions
FOR UPDATE
USING (user_id = auth.uid());

-- Policy: users can delete only their own subscriptions (optional)
CREATE POLICY user_delete_own_subscriptions
ON user_subscriptions
FOR DELETE
USING (user_id = auth.uid());
