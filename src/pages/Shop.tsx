import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories, brands } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import SEOHead from "@/components/SEOHead";

const ITEMS_PER_PAGE = 12;

type SortOption = "newest" | "price-asc" | "price-desc" | "rating" | "name";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  rating: "Top Rated",
  name: "Name A-Z",
};

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);
  const { data: products = [], isLoading } = useProducts();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSort, setShowSort] = useState(false);

  const maxPrice = useMemo(() => Math.max(...products.map((p) => p.price), 300), [products]);

  const filtered = useMemo(() => {
    let result = products;

    // Category
    if (activeCategory !== "all") result = result.filter((p) => p.category === activeCategory);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    // Brand
    if (selectedBrands.length > 0) result = result.filter((p) => selectedBrands.includes(p.brand));

    // Price
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Rating
    if (minRating > 0) result = result.filter((p) => p.rating >= minRating);

    // Sort
    switch (sortBy) {
      case "price-asc": result = [...result].sort((a, b) => a.price - b.price); break;
      case "price-desc": result = [...result].sort((a, b) => b.price - a.price); break;
      case "rating": result = [...result].sort((a, b) => b.rating - a.rating); break;
      case "name": result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }

    return result;
  }, [products, activeCategory, searchQuery, selectedBrands, priceRange, minRating, sortBy]);

  const paginated = filtered.slice(0, page * ITEMS_PER_PAGE);

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    setPage(1);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBrands([]);
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setSortBy("newest");
    setActiveCategory("all");
    setPage(1);
  };

  const hasActiveFilters = searchQuery || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice || minRating > 0;

  return (
    <div className="min-h-screen">
      <SEOHead title="Shop Premium Shoes | Emery Collection" description="Browse our full collection of premium sneakers, boots, heels & sandals. Free shipping on all orders." canonical="https://emerycollectionshop.store/shop" />
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-6 sm:py-12">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-4xl font-bold">Shop All</h1>
          <span className="text-xs sm:text-sm text-muted-foreground">{filtered.length} products</span>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search shoes, brands..."
              className="pl-10 bg-card"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">
                !
              </span>
            )}
          </Button>
          <div className="relative">
            <Button variant="outline" onClick={() => setShowSort(!showSort)} className="gap-2 min-w-[140px] justify-between">
              <span className="text-xs sm:text-sm truncate">{sortLabels[sortBy]}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-elevated z-20 min-w-[180px]">
                {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setSortBy(key); setShowSort(false); setPage(1); }}
                    className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg ${sortBy === key ? "font-semibold text-accent" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card rounded-lg p-4 sm:p-6 shadow-soft mb-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-accent hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Brand</p>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedBrands.includes(brand)
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Price Range: €{priceRange[0]} — €{priceRange[1]}
              </p>
              <Slider
                min={0}
                max={maxPrice}
                step={10}
                value={priceRange}
                onValueChange={(v) => { setPriceRange(v as [number, number]); setPage(1); }}
                className="w-full"
              />
            </div>

            {/* Min Rating */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Minimum Rating</p>
              <div className="flex gap-1.5">
                {[0, 3, 3.5, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => { setMinRating(r); setPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      minRating === r ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                  >
                    {r === 0 ? "All" : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {paginated.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
            {paginated.length < filtered.length && (
              <div className="text-center mt-10">
                <Button onClick={() => setPage((p) => p + 1)} variant="outline" className="px-8">
                  Load More ({filtered.length - paginated.length} remaining)
                </Button>
              </div>
            )}
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No products match your filters.</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
