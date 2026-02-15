import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const filtered = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="font-display text-4xl font-bold mb-8">Shop All</h1>
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setActiveCategory(c.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === c.slug ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-20">No products found in this category.</p>}
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
