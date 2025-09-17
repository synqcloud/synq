-- Create the table
CREATE TABLE IF NOT EXISTS daily_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  core_card_id UUID REFERENCES public.core_cards(id),
  created_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  processed_at TIMESTAMP,
  attempts INTEGER DEFAULT 0,
  CONSTRAINT daily_queue_unique UNIQUE (core_card_id, created_date)
);

-- Enable Row Level Security on the table
ALTER TABLE daily_processing_queue ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows only service role (edge functions) to access the table
-- This policy allows ALL operations (SELECT, INSERT, UPDATE, DELETE) for service role only
CREATE POLICY "Only service role can access daily_processing_queue"
ON daily_processing_queue
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Revoke all permissions from public/authenticated users
REVOKE ALL ON daily_processing_queue FROM public;
REVOKE ALL ON daily_processing_queue FROM authenticated;

-- Grant necessary permissions only to service_role (used by edge functions)
GRANT ALL ON daily_processing_queue TO service_role;

-- Optional: Create an index for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_daily_queue_status_date
ON daily_processing_queue (created_date, status);

CREATE INDEX IF NOT EXISTS idx_daily_queue_core_card
ON daily_processing_queue (core_card_id);
