import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getImage } from "@/lib/images";
import OptimizedImage from "@/components/OptimizedImage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeroConfig, defaultHeroConfig } from "@/hooks/useSiteSettings";
import { ArrowRight } from "lucide-react";

const HeroBanner = () => {
  const [config, setConfig] = useState<HeroConfig>(defaultHeroConfig);

  useEffect(() => {
    supabase
      .from("store_settings")
      .select("value")
      .eq("key", "hero_config")
      .maybeSingle()
      .then(({ data }) => {
        try {
          if (data?.value) setConfig(JSON.parse(data.value) as HeroConfig);
        } catch {}
      });

    const channel = supabase
      .channel("hero-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings", filter: "key=eq.hero_config" },
        (payload) => {
          try {
            const newValue = (payload.new as { value: string })?.value;
            if (newValue) setConfig(JSON.parse(newValue) as HeroConfig);
          } catch {}
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const heroImage = config.imageUrl || getImage("hero-banner");

  return (
    <section className="relative h-[75vh] sm:h-[85vh] md:h-[90vh] min-h-[500px] overflow-hidden">
      <OptimizedImage src={heroImage} alt="Premium leather shoes" className="absolute inset-0 w-full h-full object-cover scale-105" eager />
      <div className="absolute inset-0 bg-hero-overlay" />

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="relative container mx-auto px-4 lg:px-8 h-full flex items-end pb-16 sm:pb-24 md:items-center md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-accent text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-3 sm:mb-5"
          >
            {config.subtitle}
          </motion.p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-4 sm:mb-6">
            {config.title}{" "}
            <span className="text-gradient-warm">{config.titleAccent}</span>
          </h1>
          <p className="text-white/70 text-sm sm:text-lg mb-6 sm:mb-10 leading-relaxed max-w-lg">
            {config.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 h-12 sm:h-14 text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl transition-all group w-full sm:w-auto">
              <Link to={config.primaryCta.url}>
                {config.primaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/25 text-white hover:bg-white/10 h-12 sm:h-14 text-sm sm:text-base rounded-full w-full sm:w-auto">
              <Link to={config.secondaryCta.url}>{config.secondaryCta.label}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
