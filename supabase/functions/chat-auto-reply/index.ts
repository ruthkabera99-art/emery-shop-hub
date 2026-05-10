// Smart chat auto-reply using Lovable AI + admin-managed training entries.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface HistoryMsg { role: "user" | "assistant"; content: string }

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

    // Pull enabled training entries (service role bypasses RLS — fine for read)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: training } = await supabase
      .from("chat_training")
      .select("title, content, category, priority")
      .eq("enabled", true)
      .order("priority", { ascending: false })
      .limit(50);

    const knowledge = (training ?? [])
      .map((t) => `### ${t.title} [${t.category}]\n${t.content}`)
      .join("\n\n");

    const systemPrompt = `You are the friendly AI assistant for an online sneaker store.
Reply concisely (1–3 short sentences), in the visitor's language, and stay strictly on-topic.
Use ONLY the knowledge below to answer — if something isn't covered, say a human agent will follow up shortly.
Never invent prices, stock, order numbers, tracking codes, or policies.

KNOWLEDGE BASE:
${knowledge || "(no training entries yet)"}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).slice(-8),
      { role: "user", content: message },
    ];

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
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
