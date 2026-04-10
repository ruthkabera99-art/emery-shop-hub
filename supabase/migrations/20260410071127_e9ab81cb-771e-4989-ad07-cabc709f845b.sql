
-- ============ PRODUCTS ============
-- Drop permissive policies
DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
DROP POLICY IF EXISTS "Anyone can update products" ON public.products;
DROP POLICY IF EXISTS "Anyone can delete products" ON public.products;

-- Admin-only write policies
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ STORE_SETTINGS ============
DROP POLICY IF EXISTS "Anyone can insert settings" ON public.store_settings;
DROP POLICY IF EXISTS "Anyone can update settings" ON public.store_settings;
DROP POLICY IF EXISTS "Anyone can delete settings" ON public.store_settings;

CREATE POLICY "Admins can insert settings"
ON public.store_settings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
ON public.store_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete settings"
ON public.store_settings FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ REVIEWS ============
DROP POLICY IF EXISTS "Anyone can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can delete reviews" ON public.reviews;

CREATE POLICY "Admins can update reviews"
ON public.reviews FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reviews"
ON public.reviews FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ COUPONS ============
DROP POLICY IF EXISTS "Authenticated users can manage coupons" ON public.coupons;

CREATE POLICY "Admins can manage coupons"
ON public.coupons FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ CONVERSATIONS ============
DROP POLICY IF EXISTS "Authenticated users can update conversations" ON public.conversations;

CREATE POLICY "Admins can update conversations"
ON public.conversations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ MESSAGES ============
DROP POLICY IF EXISTS "Authenticated users can update messages" ON public.messages;

CREATE POLICY "Admins can update messages"
ON public.messages FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ ORDERS ============
-- Drop overly permissive admin policies and recreate with role check
DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Admins can read all orders"
ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
