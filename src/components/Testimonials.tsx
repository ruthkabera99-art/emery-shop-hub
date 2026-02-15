import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { testimonials } from "@/data/products";

const Testimonials = () => (
  <section className="py-20 bg-secondary">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">What Our Customers Say</h2>
        <p className="text-muted-foreground">Real reviews from real shoe lovers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-lg p-6 shadow-soft"
          >
            <Quote className="h-6 w-6 text-accent mb-4" />
            <p className="text-sm leading-relaxed mb-4">{t.text}</p>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="h-3 w-3 fill-accent text-accent" />
              ))}
            </div>
            <p className="font-semibold text-sm">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.location}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
