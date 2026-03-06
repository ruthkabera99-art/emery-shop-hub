import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 12;

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);
  const { data: products = [], isLoading } = useProducts();

  const filtered = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);
  const paginated = filtered.slice(0, page * ITEMS_PER_PAGE);

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-6 sm:py-12">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-4xl font-bold">Shop All</h1>
          <span className="text-xs sm:text-sm text-muted-foreground">{filtered.length} products</span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-10 -mx-1 px-1 overflow-x-auto pb-2">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => handleCategoryChange(c.slug)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === c.slug ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
