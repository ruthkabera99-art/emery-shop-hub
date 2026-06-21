
-- Deny-all RLS on realtime.messages to prevent unrestricted channel subscriptions.
-- (We don't use Realtime Authorization channels; table-level realtime still works via separate broadcast.)
DO $$ BEGIN
  EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN NULL; END $$;

DROP POLICY IF EXISTS "deny all realtime channel subscriptions" ON realtime.messages;
CREATE POLICY "deny all realtime channel subscriptions"
  ON realtime.messages
  FOR SELECT
  TO authenticated, anon
  USING (false);
