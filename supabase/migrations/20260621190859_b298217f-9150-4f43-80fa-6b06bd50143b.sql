CREATE TABLE public.chat_auto_reply_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  latency_ms integer NOT NULL,
  status text NOT NULL,
  ai_status integer,
  model text,
  error text,
  timed_out boolean NOT NULL DEFAULT false,
  message_chars integer,
  knowledge_chars integer,
  history_count integer
);

CREATE INDEX chat_auto_reply_metrics_created_at_idx ON public.chat_auto_reply_metrics (created_at DESC);
CREATE INDEX chat_auto_reply_metrics_status_idx ON public.chat_auto_reply_metrics (status);

GRANT SELECT ON public.chat_auto_reply_metrics TO authenticated;
GRANT ALL ON public.chat_auto_reply_metrics TO service_role;

ALTER TABLE public.chat_auto_reply_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view chat auto-reply metrics"
  ON public.chat_auto_reply_metrics
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));