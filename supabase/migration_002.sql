-- Migration 002: Storage policies para collection-images
-- Ejecutar en Supabase > SQL Editor
-- (El bucket debe existir antes de correr esto)

CREATE POLICY "usuarios suben sus propias imagenes"
ON storage.objects FOR INSERT
TO aut
henticated
WITH CHECK (
  bucket_id = 'collection-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "lectura publica de imagenes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'collection-images');

CREATE POLICY "usuarios eliminan sus propias imagenes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'collection-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
