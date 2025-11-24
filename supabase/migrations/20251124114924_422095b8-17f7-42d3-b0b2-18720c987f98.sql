-- Create storage bucket for OSINT image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('osint-images', 'osint-images', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for uploading images
CREATE POLICY "Anyone can upload OSINT images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'osint-images');

-- RLS policy for reading images
CREATE POLICY "Anyone can read OSINT images"
ON storage.objects FOR SELECT
USING (bucket_id = 'osint-images');

-- Add image_url column to search_jobs table
ALTER TABLE search_jobs ADD COLUMN IF NOT EXISTS image_url TEXT;