-- Migration: Create storage bucket for MTG card data
-- Description: Creates a private storage bucket for storing card data JSON files

-- Create storage bucket for card data
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-data',
  'card-data',
  false, -- Private bucket
  104857600, -- 50MB max file size
  ARRAY['application/json']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read from the bucket
CREATE POLICY "Allow authenticated users to read card data"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'card-data');

-- Allow service role to upload/update files
CREATE POLICY "Allow service role to manage card data"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'card-data');

-- Optional: Allow specific authenticated users to upload (if needed for admin panel)
-- Uncomment if you want authenticated users to upload
/*
CREATE POLICY "Allow authenticated users to upload card data"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'card-data');

CREATE POLICY "Allow authenticated users to update card data"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'card-data');

CREATE POLICY "Allow authenticated users to delete card data"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'card-data');
*/

-- Create a helper function to get the latest data file
CREATE OR REPLACE FUNCTION get_latest_card_data_file()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  latest_file TEXT;
BEGIN
  SELECT name INTO latest_file
  FROM storage.objects
  WHERE bucket_id = 'card-data'
    AND name LIKE 'magic/data-prices-%.json'
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN latest_file;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_latest_card_data_file() TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_card_data_file() TO service_role;

COMMENT ON FUNCTION get_latest_card_data_file() IS 'Returns the name of the most recently uploaded card data file';
