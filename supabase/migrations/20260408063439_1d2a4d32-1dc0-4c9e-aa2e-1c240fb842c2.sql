
-- Allow authenticated users (admins) to read ALL orders
CREATE POLICY "Admins can read all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users (admins) to update order status
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
