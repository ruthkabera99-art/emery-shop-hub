
-- Allow anonymous CRUD on products until auth is implemented
DROP POLICY "Authenticated users can insert products" ON public.products;
DROP POLICY "Authenticated users can update products" ON public.products;
DROP POLICY "Authenticated users can delete products" ON public.products;

CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

-- Allow anonymous CRUD on reviews
DROP POLICY "Authenticated users can update reviews" ON public.reviews;
DROP POLICY "Authenticated users can delete reviews" ON public.reviews;

CREATE POLICY "Anyone can update reviews" ON public.reviews FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete reviews" ON public.reviews FOR DELETE USING (true);

-- Allow anonymous CRUD on store_settings
DROP POLICY "Authenticated users can insert settings" ON public.store_settings;
DROP POLICY "Authenticated users can update settings" ON public.store_settings;
DROP POLICY "Authenticated users can delete settings" ON public.store_settings;

CREATE POLICY "Anyone can insert settings" ON public.store_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update settings" ON public.store_settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete settings" ON public.store_settings FOR DELETE USING (true);
