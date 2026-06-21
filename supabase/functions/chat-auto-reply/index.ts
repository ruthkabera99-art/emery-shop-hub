// Smart chat auto-reply using Lovable AI + admin-managed training entries.
// Optimized for low latency:
//  - In-memory cache of training entries (60s TTL) avoids a DB round-trip per request
//  - Uses the fast `flash-lite` model with a tight max_tokens cap
//  - Trims knowledge + history to keep prompt small
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface HistoryMsg { role: "user" | "assistant"; content: string }

// Module-scope cache (persists across invocations on a warm isolate)
let cachedKnowledge: string | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function getKnowledge(): Promise<string> {
  const now = Date.now();
  if (cachedKnowledge !== null && now - cachedAt < CACHE_TTL_MS) {
    return cachedKnowledge;
  }
  const { data } = await supabase
    .from("chat_training")
    .select("title, content, category, priority")
    .eq("enabled", true)
    .order("priority", { ascending: false })
    .limit(30);

  const knowledge = (data ?? [])
    .map((t) => `### ${t.title} [${t.category}]\n${t.content}`)
    .join("\n\n");

  cachedKnowledge = knowledge;
  cachedAt = now;
  return knowledge;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, history } = await req.json() as { message: string; history?: HistoryMsg[] };
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const knowledge = await getKnowledge();

    const systemPrompt = `You are the friendly AI assistant for an online sneaker store.
Reply concisely (1–2 short sentences), in the visitor's language, and stay strictly on-topic.
Use ONLY the knowledge below — if something isn't covered, say a human agent will follow up shortly.
Never invent prices, stock, order numbers, tracking codes, or policies.

KNOWLEDGE BASE:
${knowledge || "(no training entries yet)"}`;

    const trimmedHistory = (history ?? []).slice(-6).map((h) => ({
      role: h.role,
      content: typeof h.content === "string" ? h.content.slice(0, 500) : "",
    }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...trimmedHistory,
      { role: "user", content: message.slice(0, 1000) },
    ];

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite",
        messages,
        max_tokens: 180,
        temperature: 0.4,
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "rate_limited", reply: "Thanks! Our team will reply shortly." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "credits_exhausted", reply: "Thanks for your message! A team member will get back to you shortly." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "ai_error", reply: "Thanks! We'll get back to you shortly." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim()
      || "Thanks for your message! Our team will get back to you shortly.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-auto-reply error", e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "unknown",
      reply: "Thanks for your message! Our team will get back to you shortly.",
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
