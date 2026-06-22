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

const MODEL = "google/gemini-3.1-flash-lite";
const AI_TIMEOUT_MS = 10_000;

// Module-scope cache (persists across invocations on a warm isolate)
let cachedKnowledge: string | null = null;
let cachedAt = 0;
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
    const { message, history } = await req.json() as { message: string; history?: HistoryMsg[] };
    if (!message || typeof message !== "string") {
      logMetric({ latency_ms: Date.now() - started, status: "bad_request", error: "message missing" });
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const knowledge = await getKnowledge();
    knowledgeChars = knowledge.length;
    messageChars = message.length;

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
          max_tokens: 180,
          temperature: 0.4,
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
