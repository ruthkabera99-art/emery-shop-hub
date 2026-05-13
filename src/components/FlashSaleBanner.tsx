import { useEffect, useState } from "react";
import { Flame, X, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STORAGE_END = "flashSaleEndsAt";
const STORAGE_DISMISS = "flashSaleDismissed";
const DURATION_MS = 1000 * 60 * 60 * 48; // 48h
const CODE = "FLASH20";
const DISCOUNT = "20%";

const getEndsAt = () => {
  const saved = localStorage.getItem(STORAGE_END);
  if (saved) {
    const n = parseInt(saved, 10);
    if (!Number.isNaN(n) && n > Date.now()) return n;
  }
  const next = Date.now() + DURATION_MS;
  localStorage.setItem(STORAGE_END, String(next));
  return next;
};

const fmt = (ms: number) => {
  if (ms < 0) ms = 0;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

const FlashSaleBanner = () => {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_DISMISS) === "1") {
      setDismissed(true);
      return;
    }
    setEndsAt(getEndsAt());
    setViewers(28 + Math.floor(Math.random() * 47));
  }, []);

  useEffect(() => {
    if (!endsAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  useEffect(() => {
    const t = setInterval(
      () => setViewers((v) => Math.max(12, v + (Math.random() > 0.5 ? 1 : -1))),
      4000,
    );
    return () => clearInterval(t);
  }, []);

  if (dismissed || !endsAt) return null;
  const remaining = endsAt - now;
  if (remaining <= 0) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      toast({ title: "Code copied!", description: `Apply ${CODE} at checkout for ${DISCOUNT} off.` });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: CODE, description: "Copy this code and use it at checkout." });
    }
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_DISMISS, "1");
    setDismissed(true);
  };

  return (
    <div className="relative bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_50%,white_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />
      <div className="container mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-sm relative">
        <div className="flex items-center gap-1.5 font-semibold">
          <Flame className="h-4 w-4 animate-pulse" />
          FLASH SALE • {DISCOUNT} OFF
        </div>
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          Ends in <span className="bg-background/20 backdrop-blur px-2 py-0.5 rounded">{fmt(remaining)}</span>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 bg-background/20 hover:bg-background/30 backdrop-blur px-2.5 py-1 rounded font-semibold transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {CODE}
        </button>
        <div className="hidden sm:flex items-center gap-1.5 opacity-90">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-background opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-background" />
          </span>
          {viewers} people shopping now
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss banner"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-background/20 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default FlashSaleBanner;
