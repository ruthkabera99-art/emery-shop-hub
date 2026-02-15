import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 12;

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(0, page * ITEMS_PER_PAGE);

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl font-bold">Shop All</h1>
          <span className="text-sm text-muted-foreground">{filtered.length} products</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => handleCategoryChange(c.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === c.slug ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginated.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
        {paginated.length < filtered.length && (
          <div className="text-center mt-10">
            <Button onClick={() => setPage((p) => p + 1)} variant="outline" className="px-8">
              Load More ({filtered.length - paginated.length} remaining)
            </Button>
          </div>
        )}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-20">No products found in this category.</p>}
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
