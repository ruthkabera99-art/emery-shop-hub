import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getImage } from "@/lib/images";
import OptimizedImage from "@/components/OptimizedImage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeroConfig, defaultHeroConfig } from "@/hooks/useSiteSettings";

const HeroBanner = () => {
  const [config, setConfig] = useState<HeroConfig>(defaultHeroConfig);

  useEffect(() => {
    // Load initial config
    supabase
      .from("store_settings")
      .select("value")
      .eq("key", "hero_config")
      .maybeSingle()
      .then(({ data }) => {
        try {
          if (data?.value) setConfig(JSON.parse(data.value) as HeroConfig);
        } catch { /* use defaults */ }
      });

    // Subscribe to realtime changes
    const channel = supabase
      .channel("hero-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings", filter: "key=eq.hero_config" },
        (payload) => {
          try {
            const newValue = (payload.new as { value: string })?.value;
            if (newValue) setConfig(JSON.parse(newValue) as HeroConfig);
          } catch { /* ignore */ }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const heroImage = config.imageUrl || getImage("hero-banner");

  return (
    <section className="relative h-[70vh] sm:h-[80vh] md:h-[85vh] min-h-[400px] overflow-hidden">
      <OptimizedImage src={heroImage} alt="Premium leather shoes" className="absolute inset-0 w-full h-full object-cover" eager />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="relative container mx-auto px-4 lg:px-8 h-full flex items-end pb-12 sm:items-center sm:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl"
        >
          <p className="text-accent-foreground/80 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase mb-2 sm:mb-4">
            {config.subtitle}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-accent-foreground leading-[1.1] mb-3 sm:mb-6">
            {config.title} <span className="text-gradient-warm">{config.titleAccent}</span>
          </h1>
          <p className="text-accent-foreground/70 text-sm sm:text-lg mb-5 sm:mb-8 leading-relaxed max-w-[90%]">
            {config.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 w-full sm:w-auto">
              <Link to={config.primaryCta.url}>{config.primaryCta.label}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10 w-full sm:w-auto">
              <Link to={config.secondaryCta.url}>{config.secondaryCta.label}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
