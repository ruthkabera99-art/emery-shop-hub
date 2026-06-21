
-- 1. Profiles: restrict SELECT to own
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Reviews: require authentication to insert
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Storage: drop broad SELECT policy to prevent listing.
-- Files in public buckets remain accessible via their public URL.
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;

-- 4. Remove store_settings from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.store_settings;
