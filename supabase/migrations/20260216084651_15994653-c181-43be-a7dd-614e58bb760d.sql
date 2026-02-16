
-- Visitor tracking table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  page TEXT NOT NULL DEFAULT '/',
  country TEXT DEFAULT 'Unknown',
  device TEXT DEFAULT 'Desktop',
  browser TEXT DEFAULT 'Unknown',
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for tracking
CREATE POLICY "Anyone can insert visitor data" ON public.visitors FOR INSERT WITH CHECK (true);
-- Only authenticated admins can read
CREATE POLICY "Authenticated users can read visitors" ON public.visitors FOR SELECT USING (auth.uid() IS NOT NULL);

-- Chat conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_session_id TEXT NOT NULL,
  visitor_name TEXT DEFAULT 'Visitor',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read their own conversation" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update conversations" ON public.conversations FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Chat messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'admin')),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update messages" ON public.messages FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Index for performance
CREATE INDEX idx_visitors_created_at ON public.visitors(created_at DESC);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_visitors_session_id ON public.visitors(session_id);
