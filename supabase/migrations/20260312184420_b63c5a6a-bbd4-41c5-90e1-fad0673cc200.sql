
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL DEFAULT 0,
  min_order_amount numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone DEFAULT NULL
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active coupons" ON public.coupons FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can manage coupons" ON public.coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add stock_quantity to products for better stock management
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 50;

-- Seed some sample coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount) VALUES
  ('WELCOME10', 'percentage', 10, 50),
  ('SAVE20', 'fixed', 20, 100),
  ('VIP15', 'percentage', 15, 0);
