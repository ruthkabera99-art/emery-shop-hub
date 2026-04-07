import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/products";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FeaturedProducts = ({ title, filter }: { title: string; filter?: (p: Product) => boolean }) => {
  const { data: products = [], isLoading } = useProducts();
  const filtered = filter ? products.filter(filter) : products;

  return (
    <section className="py-12 sm:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-14 gap-3"
        >
          <div>
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-2">Curated</p>
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold">{title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">Handpicked for exceptional quality and style</p>
          </div>
          <Link to="/shop" className="group inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors shrink-0">
            View All
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
            {filtered.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
