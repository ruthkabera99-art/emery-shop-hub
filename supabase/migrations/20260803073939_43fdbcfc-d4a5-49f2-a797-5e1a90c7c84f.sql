-- 1. Purge Stripe secret from DB and restrict public reads of sensitive settings
DELETE FROM public.store_settings WHERE key IN ('stripeSecretKey');

DROP POLICY IF EXISTS "Anyone can read settings" ON public.store_settings;

CREATE POLICY "Public can read non-sensitive settings"
ON public.store_settings FOR SELECT TO anon, authenticated
USING (
  key NOT ILIKE '%secret%'
  AND key NOT ILIKE '%stripe%'
  AND key NOT ILIKE '%apikey%'
  AND key NOT ILIKE '%api_key%'
  AND key NOT ILIKE '%token%'
  AND key NOT ILIKE '%password%'
  AND key NOT ILIKE '%private%'
);

CREATE POLICY "Admins can read all settings"
ON public.store_settings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. chat_training: no public read
DROP POLICY IF EXISTS "Public can read enabled training" ON public.chat_training;
REVOKE SELECT ON public.chat_training FROM anon;

-- 3. coupons: no public enumeration, validate via RPC instead
DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;
REVOKE SELECT ON public.coupons FROM anon;

CREATE OR REPLACE FUNCTION public.validate_coupon(_code text, _order_total numeric)
RETURNS TABLE (valid boolean, code text, discount_type text, discount_value numeric, message text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  c public.coupons%ROWTYPE;
  norm text;
BEGIN
  norm := upper(btrim(coalesce(_code, '')));
  IF norm = '' OR length(norm) > 64 THEN
    RETURN QUERY SELECT false, norm, 'fixed'::text, 0::numeric, 'Invalid coupon code'::text;
    RETURN;
  END IF;
  IF _order_total IS NULL OR _order_total < 0 THEN
    RETURN QUERY SELECT false, norm, 'fixed'::text, 0::numeric, 'Invalid order total'::text;
    RETURN;
  END IF;

  SELECT * INTO c FROM public.coupons
  WHERE upper(coupons.code) = norm AND is_active = true
  LIMIT 1;

  IF c.id IS NULL THEN
    RETURN QUERY SELECT false, norm, 'fixed'::text, 0::numeric, 'Invalid coupon code'::text;
    RETURN;
  END IF;

  IF c.expires_at IS NOT NULL AND c.expires_at < now() THEN
    RETURN QUERY SELECT false, norm, 'fixed'::text, 0::numeric, 'This coupon has expired'::text;
    RETURN;
  END IF;

  IF c.max_uses IS NOT NULL AND c.used_count >= c.max_uses THEN
    RETURN QUERY SELECT false, norm, 'fixed'::text, 0::numeric, 'This coupon has reached its usage limit'::text;
    RETURN;
  END IF;

  IF c.min_order_amount IS NOT NULL AND _order_total < c.min_order_amount THEN
    RETURN QUERY SELECT false, norm, c.discount_type, c.discount_value,
      ('Minimum order of ' || to_char(c.min_order_amount, 'FM999999990') || ' required')::text;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, c.code, c.discount_type, c.discount_value,
    CASE WHEN c.discount_type = 'percentage'
      THEN to_char(c.discount_value, 'FM999999990.99') || '% off applied!'
      ELSE to_char(c.discount_value, 'FM999999990.99') || ' off applied!'
    END::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_coupon(text, numeric) TO anon, authenticated;