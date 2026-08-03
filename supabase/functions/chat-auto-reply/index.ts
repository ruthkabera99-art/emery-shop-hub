// Smart chat auto-reply using Lovable AI + admin-managed training entries.
// Optimized for low latency + observability:
//  - In-memory cache of training entries (60s TTL) avoids a DB round-trip per request
//  - Uses the fast `flash-lite` model with a tight max_tokens cap
//  - Trims knowledge + history to keep prompt small
//  - 12s AbortController timeout on the AI gateway call
//  - Logs latency / status / errors to `chat_auto_reply_metrics` (fire-and-forget)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface HistoryMsg { role: "user" | "assistant"; content: string }

const MODEL = "openai/gpt-5.6-sol";
const AI_TIMEOUT_MS = 15_000;

// Module-scope cache (persists across invocations on a warm isolate)
let cachedKnowledge: string | null = null;
let cachedAt = 0;
let cachedCatalog: string | null = null;
let catalogAt = 0;
const CACHE_TTL_MS = 300_000; // 5 min

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

// Live product catalog so the assistant can genuinely recommend and explain
// products instead of speaking in generalities.
async function getCatalog(): Promise<string> {
  const now = Date.now();
  if (cachedCatalog !== null && now - catalogAt < CACHE_TTL_MS) return cachedCatalog;

  const { data } = await supabase
    .from("products")
    .select("name, brand, category, price, badge, in_stock, stock_quantity, rating, reviews_count, description")
    .order("rating", { ascending: false })
    .limit(80);

  const catalog = (data ?? [])
    .map((p) => {
      const stock = p.in_stock === false || (p.stock_quantity ?? 0) <= 0
        ? "SOLD OUT"
        : (p.stock_quantity ?? 0) <= 5
          ? `only ${p.stock_quantity} left`
          : "in stock";
      const rating = p.rating ? `${p.rating}★ (${p.reviews_count ?? 0} reviews)` : "new";
      const desc = (p.description ?? "").replace(/\s+/g, " ").slice(0, 160);
      return `- ${p.name} | ${p.brand} | ${p.category} | €${p.price} | ${stock} | ${rating}${p.badge ? ` | ${p.badge}` : ""}${desc ? ` | ${desc}` : ""}`;
    })
    .join("\n");

  cachedCatalog = catalog;
  catalogAt = now;
  return catalog;
}


interface MetricRow {
  latency_ms: number;
  status: string;
  ai_status?: number | null;
  model?: string | null;
  error?: string | null;
  timed_out?: boolean;
  message_chars?: number | null;
  knowledge_chars?: number | null;
  history_count?: number | null;
}

function logMetric(row: MetricRow) {
  // Fire-and-forget — never block the response on metric write.
  supabase.from("chat_auto_reply_metrics").insert({
    latency_ms: row.latency_ms,
    status: row.status,
    ai_status: row.ai_status ?? null,
    model: row.model ?? MODEL,
    error: row.error ? String(row.error).slice(0, 500) : null,
    timed_out: row.timed_out ?? false,
    message_chars: row.message_chars ?? null,
    knowledge_chars: row.knowledge_chars ?? null,
    history_count: row.history_count ?? null,
  }).then(({ error }) => {
    if (error) console.error("metric insert failed", error.message);
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const started = Date.now();
  let messageChars = 0;
  let knowledgeChars = 0;
  let historyCount = 0;

  try {
    const { message, history, warmup } = await req.json() as { message?: string; history?: HistoryMsg[]; warmup?: boolean };

    // Warmup ping: pre-load knowledge + catalog cache and return immediately.
    // Keeps the isolate hot so the next real message is sub-second.
    if (warmup) {
      await Promise.all([getKnowledge(), getCatalog()]);
      return new Response(JSON.stringify({ ok: true, warm: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!message || typeof message !== "string") {
      logMetric({ latency_ms: Date.now() - started, status: "bad_request", error: "message missing" });
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const [knowledge, catalog] = await Promise.all([getKnowledge(), getCatalog()]);
    knowledgeChars = knowledge.length;
    messageChars = message.length;

    const systemPrompt = `You are "Emery", the senior personal shopping advisor and customer-support specialist for Emery Collection Shop — a premium online footwear store (sneakers, Jordans, boots, Italian leather shoes, loafers, dress shoes). Currency is Euro (€).

YOUR MISSION
Act like a real, warm, expert human sales assistant on a shop floor — not a robot FAQ. You understand shoes deeply (materials, construction, comfort, sizing, styling, care) and you help every visitor confidently choose the RIGHT pair, then explain clearly WHY it is right for them so they genuinely fall in love with it.

HOW TO CONSULT (in order)
1. Understand first. If the need is vague, ask ONE short, smart qualifying question (occasion, style, budget, size, or usual brand) — never a list of questions.
2. Recommend concretely. Name 1–3 actual products from the CATALOG with their exact name and € price. Never invent a product, price, or discount.
3. Explain in full and persuasively. For the pick you recommend, cover:
   • What it is and who it's perfect for
   • Material & build quality (leather, suede, mesh, rubber outsole, stitching) and what that means in real life
   • Comfort & fit (cushioning, support, sizing advice, break-in, wide/narrow feet)
   • Style & versatility — 2–3 concrete outfit/occasion pairings
   • Durability & care in one line
   • Value: why this price is worth it vs. alternatives
4. Handle objections honestly (price, sizing doubt, "not sure it suits me") with empathy and facts, then reassure with the store's real policies from the KNOWLEDGE BASE.
5. Close gently. End with a light next step: "Want me to check your size?", "Shall I show you the matching color?", "Ready to add it to your cart?"

STYLE
- Sound human, warm, confident, enthusiastic — never pushy, never fake.
- Reply in the visitor's own language.
- Use short paragraphs or 3–5 bullet points so it is easy to read on mobile. Be detailed when explaining a product (roughly 80–160 words), but short and snappy for simple questions (greetings, shipping, order status).
- Use the customer's words back to them. Occasionally use a tasteful emoji (max 1–2).
- Never pressure, never fabricate scarcity, never promise anything not in the KNOWLEDGE BASE.

HARD RULES
- Prices, stock levels and product names must come ONLY from the CATALOG below.
- Policies (shipping, returns, payment, warranty) must come ONLY from the KNOWLEDGE BASE. If it isn't there, say a human teammate will confirm shortly — do not guess.
- Never invent order numbers, tracking codes, coupon codes, or discounts.
- Stay on-topic: footwear, the store, orders, and styling.

LIVE PRODUCT CATALOG (name | brand | category | price | stock | rating | badge | description):
${catalog || "(catalog unavailable right now — recommend generally and offer a human follow-up)"}

KNOWLEDGE BASE (store policies & admin-provided facts):
${knowledge || "(no training entries yet)"}`;

    const trimmedHistory = (history ?? []).slice(-10).map((h) => ({
      role: h.role,
      content: typeof h.content === "string" ? h.content.slice(0, 900) : "",
    }));
    historyCount = trimmedHistory.length;

    const messages = [
      { role: "system", content: systemPrompt },
      ...trimmedHistory,
      { role: "user", content: message.slice(0, 1000) },
    ];

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), AI_TIMEOUT_MS);

    let aiResp: Response;
    try {
      aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          max_completion_tokens: 900,
          reasoning_effort: "none",
        }),
        signal: ac.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      const timedOut = (err as Error)?.name === "AbortError";
      logMetric({
        latency_ms: Date.now() - started,
        status: timedOut ? "timeout" : "fetch_error",
        timed_out: timedOut,
        error: (err as Error)?.message,
        message_chars: messageChars,
        knowledge_chars: knowledgeChars,
        history_count: historyCount,
      });
      return new Response(JSON.stringify({
        error: timedOut ? "timeout" : "fetch_error",
        reply: "Thanks! Our team will reply shortly.",
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    clearTimeout(timer);

    if (aiResp.status === 429) {
      logMetric({ latency_ms: Date.now() - started, status: "rate_limited", ai_status: 429, message_chars: messageChars, knowledge_chars: knowledgeChars, history_count: historyCount });
      return new Response(JSON.stringify({ error: "rate_limited", reply: "Thanks! Our team will reply shortly." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      logMetric({ latency_ms: Date.now() - started, status: "credits_exhausted", ai_status: 402, message_chars: messageChars, knowledge_chars: knowledgeChars, history_count: historyCount });
      return new Response(JSON.stringify({ error: "credits_exhausted", reply: "Thanks for your message! A team member will get back to you shortly." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      logMetric({
        latency_ms: Date.now() - started,
        status: "ai_error",
        ai_status: aiResp.status,
        error: t.slice(0, 400),
        message_chars: messageChars,
        knowledge_chars: knowledgeChars,
        history_count: historyCount,
      });
      return new Response(JSON.stringify({ error: "ai_error", reply: "Thanks! We'll get back to you shortly." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim()
      || "Thanks for your message! Our team will get back to you shortly.";

    const latency = Date.now() - started;
    logMetric({
      latency_ms: latency,
      status: "ok",
      ai_status: 200,
      message_chars: messageChars,
      knowledge_chars: knowledgeChars,
      history_count: historyCount,
    });

    return new Response(JSON.stringify({ reply, latency_ms: latency }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-auto-reply error", e);
    logMetric({
      latency_ms: Date.now() - started,
      status: "error",
      error: e instanceof Error ? e.message : "unknown",
      message_chars: messageChars,
      knowledge_chars: knowledgeChars,
      history_count: historyCount,
    });
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "unknown",
      reply: "Thanks for your message! Our team will get back to you shortly.",
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
