import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { testimonials as staticTestimonials } from "@/data/products";
import { Skeleton } from "@/components/ui/skeleton";

const useReviews = () => {
  return useQuery({
    queryKey: ["reviews-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data || []).map((r) => ({
        name: r.customer_name,
        text: r.comment || "",
        rating: r.rating,
        location: "Verified Buyer",
      }));
    },
  });
};

const Testimonials = () => {
  const { data: reviews, isLoading } = useReviews();
  const items = reviews && reviews.length > 0 ? reviews : staticTestimonials;

  return (
    <section className="py-12 sm:py-24 bg-secondary/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-14"
        >
          <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-2">Testimonials</p>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold mb-3">What Our Customers Say</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">Real reviews from real shoe lovers</p>
        </motion.div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 space-y-3">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.slice(0, 4).map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card rounded-2xl p-6 sm:p-8 shadow-soft hover:shadow-elevated transition-all duration-500 group"
              >
                <div className="flex items-center justify-between mb-5">
                  <Quote className="h-8 w-8 text-accent/30 group-hover:text-accent/60 transition-colors" />
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-6 text-muted-foreground">{t.text}</p>
                <div className="pt-4 border-t border-border/50">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
