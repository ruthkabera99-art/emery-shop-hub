DROP POLICY IF EXISTS "Anyone can insert visitor data" ON public.visitors;
CREATE POLICY "Anyone can insert visitor data"
ON public.visitors
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 8 AND 128
  AND page IS NOT NULL
  AND length(page) BETWEEN 1 AND 512
  AND (country IS NULL OR length(country) <= 64)
  AND (device IS NULL OR length(device) <= 64)
  AND (browser IS NULL OR length(browser) <= 128)
  AND (ip_address IS NULL OR length(ip_address) <= 64)
);