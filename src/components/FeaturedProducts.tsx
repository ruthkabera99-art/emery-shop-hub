import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/products";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedProducts = ({ title, filter }: { title: string; filter?: (p: Product) => boolean }) => {
  const { data: products = [], isLoading } = useProducts();
  const filtered = filter ? products.filter(filter) : products;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">{title}</h2>
          <p className="text-muted-foreground">Handpicked for exceptional quality and style</p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
