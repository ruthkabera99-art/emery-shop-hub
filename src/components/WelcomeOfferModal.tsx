import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Sparkles, Copy, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "welcomeOfferSeen";
const CODE = "WELCOME10";
const DISCOUNT = "10%";

const WelcomeOfferModal = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setOpen(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const claim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast({ title: "Enter a valid email", variant: "destructive" });
      return;
    }
    setRevealed(true);
    toast({ title: "Your discount is unlocked!", description: `Use ${CODE} at checkout.` });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl bg-card border border-accent/30"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/70 hover:bg-background text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative bg-gradient-to-br from-primary via-accent to-primary p-8 text-primary-foreground text-center overflow-hidden">
              <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_30%_20%,white_1.5px,transparent_1.5px)] [background-size:28px_28px]" />
              <motion.div
                animate={{ rotate: [0, -8, 8, -4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2 }}
                className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-background/20 backdrop-blur mb-3"
              >
                <Gift className="h-8 w-8" />
              </motion.div>
              <div className="relative flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.25em] font-semibold opacity-90 mb-2">
                <Sparkles className="h-3 w-3" /> Welcome offer <Sparkles className="h-3 w-3" />
              </div>
              <h2 className="relative font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Get {DISCOUNT} off<br />your first pair
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {!revealed ? (
                <>
                  <p className="text-sm text-muted-foreground text-center">
                    Join the Emery Collection insiders and unlock your discount instantly.
                  </p>
                  <form onSubmit={claim} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="pl-9 h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 text-base font-semibold">
                      Reveal my code
                    </Button>
                  </form>
                  <button
                    onClick={close}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    No thanks, I'll pay full price
                  </button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">Your code is ready — apply it at checkout:</p>
                  <button
                    onClick={copy}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-accent bg-accent/10 hover:bg-accent/20 transition-colors group"
                  >
                    <span className="font-mono font-bold text-xl tracking-widest text-accent">{CODE}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-accent">
                      {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                    </span>
                  </button>
                  <Button onClick={close} variant="outline" className="w-full">
                    Start shopping
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeOfferModal;
