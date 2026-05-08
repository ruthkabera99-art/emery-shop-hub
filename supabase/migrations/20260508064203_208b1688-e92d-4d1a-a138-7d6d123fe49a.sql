
-- ============================================================
-- 1. CHAT: lock down conversations & messages, expose via RPCs
-- ============================================================

-- Drop public SELECT policies
DROP POLICY IF EXISTS "Anyone can read their own conversation" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can read messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;

-- Admin-only direct SELECT/INSERT (visitors will use SECURITY DEFINER RPCs)
CREATE POLICY "Admins can read all conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read all messages"
  ON public.messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RPCs for visitors (scoped by session_id passed from client)
CREATE OR REPLACE FUNCTION public.get_or_create_visitor_conversation(
  _session_id text,
  _visitor_name text DEFAULT 'Visitor'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id uuid;
BEGIN
  IF _session_id IS NULL OR length(_session_id) < 8 OR length(_session_id) > 128 THEN
    RAISE EXCEPTION 'invalid session_id';
  END IF;

  SELECT id INTO conv_id
  FROM public.conversations
  WHERE visitor_session_id = _session_id AND status = 'open'
  ORDER BY created_at DESC
  LIMIT 1;

  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (visitor_session_id, visitor_name)
    VALUES (_session_id, COALESCE(NULLIF(left(_visitor_name, 80), ''), 'Visitor'))
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_visitor_messages(_session_id text)
RETURNS SETOF public.messages
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT m.*
  FROM public.messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  WHERE c.visitor_session_id = _session_id
  ORDER BY m.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_visitor_message(
  _session_id text,
  _content text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id uuid;
  msg_id uuid;
BEGIN
  IF _content IS NULL OR length(trim(_content)) = 0 THEN
    RAISE EXCEPTION 'empty message';
  END IF;
  IF length(_content) > 2000 THEN
    RAISE EXCEPTION 'message too long';
  END IF;

  SELECT id INTO conv_id
  FROM public.conversations
  WHERE visitor_session_id = _session_id AND status = 'open'
  ORDER BY created_at DESC
  LIMIT 1;

  IF conv_id IS NULL THEN
    RAISE EXCEPTION 'no open conversation for session';
  END IF;

  INSERT INTO public.messages (conversation_id, sender_type, content, status)
  VALUES (conv_id, 'visitor', _content, 'delivered')
  RETURNING id INTO msg_id;

  RETURN msg_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_visitor_auto_reply(
  _session_id text,
  _content text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id uuid;
  msg_id uuid;
BEGIN
  IF _content IS NULL OR length(_content) = 0 OR length(_content) > 2000 THEN
    RAISE EXCEPTION 'invalid content';
  END IF;

  SELECT id INTO conv_id
  FROM public.conversations
  WHERE visitor_session_id = _session_id AND status = 'open'
  ORDER BY created_at DESC LIMIT 1;

  IF conv_id IS NULL THEN
    RAISE EXCEPTION 'no open conversation';
  END IF;

  INSERT INTO public.messages (conversation_id, sender_type, content)
  VALUES (conv_id, 'admin', _content)
  RETURNING id INTO msg_id;
  RETURN msg_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_visitor_admin_messages_read(_session_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id uuid;
BEGIN
  SELECT id INTO conv_id
  FROM public.conversations
  WHERE visitor_session_id = _session_id AND status = 'open'
  ORDER BY created_at DESC LIMIT 1;

  IF conv_id IS NULL THEN RETURN; END IF;

  UPDATE public.messages
  SET status = 'read', is_read = true, read_at = now()
  WHERE conversation_id = conv_id
    AND sender_type = 'admin'
    AND (status IS DISTINCT FROM 'read' OR read_at IS NULL);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_visitor_conversation(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_visitor_messages(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_visitor_message(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_visitor_auto_reply(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_visitor_admin_messages_read(text) TO anon, authenticated;

-- ============================================================
-- 2. COUPONS: only active coupons publicly readable
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;
CREATE POLICY "Anyone can read active coupons"
  ON public.coupons FOR SELECT TO public
  USING (is_active = true);

-- ============================================================
-- 3. VISITORS: admin-only SELECT (was any authenticated user)
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can read visitors" ON public.visitors;
CREATE POLICY "Admins can read visitors"
  ON public.visitors FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 4. STORAGE: restrict product-images writes to admins only
-- ============================================================
DROP POLICY IF EXISTS "Allow anonymous deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
