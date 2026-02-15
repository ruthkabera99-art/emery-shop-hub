import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getImage } from "@/lib/images";

const HeroBanner = () => (
  <section className="relative h-[85vh] min-h-[500px] overflow-hidden">
    <img src={getImage("hero-banner")} alt="Premium leather shoes" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
    <div className="absolute inset-0 bg-hero-overlay" />
    <div className="relative container mx-auto px-4 lg:px-8 h-full flex items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-xl"
      >
        <p className="text-accent-foreground/80 text-sm font-medium tracking-[0.2em] uppercase mb-4">New Collection 2026</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-accent-foreground leading-[1.1] mb-6">
          Step Into <span className="text-gradient-warm">Elegance</span>
        </h1>
        <p className="text-accent-foreground/70 text-lg mb-8 leading-relaxed">
          Discover our curated collection of premium footwear, crafted for those who value style and comfort.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8">
            <Link to="/shop">Shop Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10">
            <Link to="/shop">View Categories</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroBanner;
