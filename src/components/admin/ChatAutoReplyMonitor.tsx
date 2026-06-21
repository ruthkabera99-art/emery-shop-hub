import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, AlertTriangle, Timer, CheckCircle2 } from "lucide-react";

interface MetricRow {
  id: string;
  created_at: string;
  latency_ms: number;
  status: string;
  ai_status: number | null;
  model: string | null;
  error: string | null;
  timed_out: boolean;
  message_chars: number | null;
  knowledge_chars: number | null;
  history_count: number | null;
}

const WINDOWS = [
  { id: "1h", label: "Last hour", ms: 60 * 60 * 1000 },
  { id: "24h", label: "Last 24h", ms: 24 * 60 * 60 * 1000 },
  { id: "7d", label: "Last 7 days", ms: 7 * 24 * 60 * 60 * 1000 },
] as const;

const STATUS_COLORS: Record<string, string> = {
  ok: "text-emerald-600 bg-emerald-50",
  timeout: "text-amber-700 bg-amber-50",
  rate_limited: "text-amber-700 bg-amber-50",
  credits_exhausted: "text-rose-700 bg-rose-50",
  ai_error: "text-rose-700 bg-rose-50",
  fetch_error: "text-rose-700 bg-rose-50",
  error: "text-rose-700 bg-rose-50",
  bad_request: "text-zinc-700 bg-zinc-100",
};

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

const ChatAutoReplyMonitor = () => {
  const [rows, setRows] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [windowId, setWindowId] = useState<typeof WINDOWS[number]["id"]>("24h");

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - WINDOWS.find((w) => w.id === windowId)!.ms).toISOString();
    const { data, error } = await supabase
      .from("chat_auto_reply_metrics")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (!error) setRows((data ?? []) as MetricRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 15_000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowId]);

  const stats = useMemo(() => {
    const total = rows.length;
    const ok = rows.filter((r) => r.status === "ok");
    const errors = rows.filter((r) => !["ok"].includes(r.status));
    const timeouts = rows.filter((r) => r.timed_out || r.status === "timeout");
    const sorted = [...rows.map((r) => r.latency_ms)].sort((a, b) => a - b);
    const avg = sorted.length ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0;
    return {
      total,
      okCount: ok.length,
      errCount: errors.length,
      timeoutCount: timeouts.length,
      successRate: total ? Math.round((ok.length / total) * 1000) / 10 : 0,
      avg,
      p50: percentile(sorted, 50),
      p95: percentile(sorted, 95),
      p99: percentile(sorted, 99),
    };
  }, [rows]);

  const byStatus = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => m.set(r.status, (m.get(r.status) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Chat Auto-Reply Monitor</h1>
          <p className="text-sm text-muted-foreground">Latency, error rates and timeouts for the AI auto-reply.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border overflow-hidden">
            {WINDOWS.map((w) => (
              <button
                key={w.id}
                onClick={() => setWindowId(w.id)}
                className={`px-3 py-1.5 text-sm ${windowId === w.id ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<Activity className="w-4 h-4" />} label="Total calls" value={stats.total.toString()} />
        <Stat icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} label="Success rate" value={`${stats.successRate}%`} sub={`${stats.okCount} ok / ${stats.errCount} errors`} />
        <Stat icon={<AlertTriangle className="w-4 h-4 text-rose-600" />} label="Errors" value={stats.errCount.toString()} sub={`${stats.timeoutCount} timeouts`} />
        <Stat icon={<Timer className="w-4 h-4 text-amber-600" />} label="Latency p95" value={`${stats.p95} ms`} sub={`avg ${stats.avg} / p50 ${stats.p50} / p99 ${stats.p99}`} />
      </div>

      <div className="bg-card rounded-xl p-5 shadow-soft">
        <h2 className="font-semibold mb-3">Status breakdown</h2>
        {byStatus.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data in this window yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {byStatus.map(([status, count]) => (
              <span key={status} className={`px-2.5 py-1 rounded text-xs font-medium ${STATUS_COLORS[status] ?? "bg-muted"}`}>
                {status}: {count}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-soft overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold">Recent calls</h2>
          <span className="text-xs text-muted-foreground">Latest {Math.min(rows.length, 50)} of {rows.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Latency</th>
                <th className="px-4 py-2 font-medium">AI</th>
                <th className="px-4 py-2 font-medium">Msg</th>
                <th className="px-4 py-2 font-medium">Hist</th>
                <th className="px-4 py-2 font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 50).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                    {new Date(r.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[r.status] ?? "bg-muted"}`}>
                      {r.status}{r.timed_out ? " ⏱" : ""}
                    </span>
                  </td>
                  <td className={`px-4 py-2 font-mono ${r.latency_ms > 5000 ? "text-rose-600" : r.latency_ms > 2500 ? "text-amber-600" : ""}`}>
                    {r.latency_ms} ms
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{r.ai_status ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.message_chars ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.history_count ?? "—"}</td>
                  <td className="px-4 py-2 text-rose-600 max-w-[280px] truncate" title={r.error ?? ""}>
                    {r.error ?? ""}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No calls logged yet in this window.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) => (
  <div className="bg-card rounded-xl p-4 shadow-soft">
    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">{icon}{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
    {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
  </div>
);

export default ChatAutoReplyMonitor;
