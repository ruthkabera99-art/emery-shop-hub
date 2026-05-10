-- Training knowledge base for the chat auto-reply AI
CREATE TABLE public.chat_training (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  enabled boolean NOT NULL DEFAULT true,
  priority int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.chat_training ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can read enabled entries — used by the edge function via service role anyway,
-- but allows admin UI read without extra round-trips.
CREATE POLICY "Admins can manage training"
ON public.chat_training
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read enabled training"
ON public.chat_training
FOR SELECT
USING (enabled = true);

CREATE INDEX idx_chat_training_enabled ON public.chat_training(enabled, priority DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.touch_chat_training()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_chat_training_updated
BEFORE UPDATE ON public.chat_training
FOR EACH ROW EXECUTE FUNCTION public.touch_chat_training();

-- Seed a few defaults so the AI has something to work with immediately
INSERT INTO public.chat_training (title, content, category, priority) VALUES
('Store identity', 'You are the AI assistant for Emery Collection Shop, a premium sneaker store for the youth market. Currency is Euro (€). Be warm, concise, and on-brand.', 'identity', 100),
('Shipping', 'We ship within 2–5 business days across Europe. Tracking info is emailed once dispatched. Free shipping on orders above €50.', 'shipping', 50),
('Returns', 'Easy 14-day returns. Items must be unused with original packaging.', 'returns', 50),
('Payments', 'We accept all major cards, PayPal, and mobile money. Checkout is secured by Stripe.', 'payments', 50),
('Sizing', 'Each product page has a detailed size guide. If a customer shares their usual size, suggest the closest fit.', 'sizing', 50);