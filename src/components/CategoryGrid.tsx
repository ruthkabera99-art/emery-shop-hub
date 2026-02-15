import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "@/data/products";
import { getImage } from "@/lib/images";

const CategoryGrid = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Shop by Category</h2>
        <p className="text-muted-foreground">Find the perfect pair for every occasion</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to="/shop" className="group block relative rounded-lg overflow-hidden aspect-square shadow-soft hover:shadow-elevated transition-shadow">
              <img src={getImage(cat.image)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/50 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary-foreground font-display text-lg font-bold">{cat.name}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryGrid;
