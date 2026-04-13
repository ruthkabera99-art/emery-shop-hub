
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent',
ADD COLUMN IF NOT EXISTS read_at timestamptz;
