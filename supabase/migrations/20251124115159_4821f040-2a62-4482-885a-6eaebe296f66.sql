-- Make the osint-images bucket public so images can be accessed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'osint-images';