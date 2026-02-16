
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  brand TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update reviews" ON public.reviews FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete reviews" ON public.reviews FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create settings table (key-value store)
CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert settings" ON public.store_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update settings" ON public.store_settings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete settings" ON public.store_settings FOR DELETE USING (auth.uid() IS NOT NULL);

-- Also fix storage policy to allow anonymous uploads for product images
CREATE POLICY "Allow anonymous uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Allow anonymous deletes" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
CREATE POLICY "Allow anonymous updates" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
