import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const FeaturedProducts = ({ title, filter }: { title: string; filter?: (p: typeof products[0]) => boolean }) => {
  const filtered = filter ? products.filter(filter) : products;
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">{title}</h2>
          <p className="text-muted-foreground">Handpicked for exceptional quality and style</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
