import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claimsData, error } = await userClient.auth.getClaims(
    authHeader.replace("Bearer ", "")
  );
  if (error || !claimsData?.claims) return null;
  const userId = claimsData.claims.sub as string;

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: roleRow } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) return null;

  return { adminClient, userId };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const ctx = await requireAdmin(req);
    if (!ctx) return json({ error: "Admin access required" }, 403);
    const { adminClient } = ctx;

    if (req.method === "GET") {
      const { data } = await adminClient
        .from("admin_secrets")
        .select("value, updated_at")
        .eq("key", "STRIPE_SECRET_KEY")
        .maybeSingle();
      const configured = !!data?.value;
      return json({
        configured,
        last4: configured ? data.value.slice(-4) : null,
        mode: configured
          ? data.value.startsWith("sk_live_") ? "live" : "test"
          : null,
        updatedAt: data?.updated_at ?? null,
      });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const key = typeof body.key === "string" ? body.key.trim() : "";
      if (!/^sk_(live|test)_[A-Za-z0-9]{8,}$/.test(key)) {
        return json({ error: "Invalid key. It must start with sk_live_ or sk_test_." }, 400);
      }
      const { error } = await adminClient.from("admin_secrets").upsert(
        { key: "STRIPE_SECRET_KEY", value: key, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      if (error) return json({ error: "Failed to save key" }, 500);
      return json({ ok: true, last4: key.slice(-4), mode: key.startsWith("sk_live_") ? "live" : "test" });
    }

    if (req.method === "DELETE") {
      await adminClient.from("admin_secrets").delete().eq("key", "STRIPE_SECRET_KEY");
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (e) {
    console.error("manage-stripe-key error:", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
