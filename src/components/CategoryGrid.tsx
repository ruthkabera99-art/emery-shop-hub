import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "@/data/products";
import { getImage } from "@/lib/images";
import OptimizedImage from "@/components/OptimizedImage";
import { ArrowUpRight } from "lucide-react";

const CategoryGrid = () => (
  <section className="py-12 sm:py-24">
    <div className="container mx-auto px-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-14"
      >
        <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-2">Browse</p>
        <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold mb-3">Shop by Category</h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">Find the perfect pair for every occasion</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <Link to="/shop" className="group block relative rounded-2xl overflow-hidden aspect-[3/4] shadow-soft hover:shadow-elevated transition-all duration-500">
              <OptimizedImage src={getImage(cat.image)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent group-hover:from-foreground/80 transition-colors duration-500" />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-5">
                <span className="text-white font-display text-base sm:text-lg font-bold">{cat.name}</span>
                <div className="flex items-center gap-1 mt-1 text-white/70 group-hover:text-accent transition-colors">
                  <span className="text-xs font-medium">Shop Now</span>
                  <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryGrid;
