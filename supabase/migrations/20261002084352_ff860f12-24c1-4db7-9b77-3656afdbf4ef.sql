CREATE TABLE public.admin_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only the service role (edge functions) may read or write secrets.
GRANT ALL ON public.admin_secrets TO service_role;

ALTER TABLE public.admin_secrets ENABLE ROW LEVEL SECURITY;
-- No policies: anon and authenticated roles have no grants and no access.