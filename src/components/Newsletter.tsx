import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Welcome aboard! 🎉", description: "Thank you for joining our newsletter." });
    setEmail("");
  };

  return (
    <section className="py-12 sm:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto text-center bg-primary rounded-3xl p-8 sm:p-14 overflow-hidden"
        >
          {/* Decorative accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Exclusive Access
            </div>
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold mb-3 text-primary-foreground">Stay in the Loop</h2>
            <p className="text-primary-foreground/60 text-sm sm:text-base mb-8 max-w-md mx-auto">
              Subscribe for exclusive drops, early access, and 10% off your first order.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 h-12 rounded-full px-5"
              />
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6 rounded-full font-semibold shadow-lg">
                <Send className="h-4 w-4 mr-2" /> Subscribe
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
