import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { getImage } from "@/lib/images";
import { formatPrice } from "@/lib/currency";
import { products as fallbackProducts } from "@/data/products";
import ImageModal from "@/components/ImageModal";
import OptimizedImage from "@/components/OptimizedImage";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: dbProducts = [], isLoading } = useProducts();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const allProducts = dbProducts.length > 0 ? dbProducts : fallbackProducts;
  const product = allProducts.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const images = [product.image];
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const nextImage = () => setCurrentImageIndex((i) => (i + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-6 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 sm:mb-8">
          <Link to="/shop" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Shop
          </Link>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="relative rounded-xl overflow-hidden bg-card shadow-soft group cursor-pointer" onClick={() => setModalOpen(true)}>
              <div className="aspect-square">
                <OptimizedImage
                  src={getImage(images[currentImageIndex])}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  eager
                />
              </div>
              {product.badge && (
                <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full ${
                  product.badge === "Sale" ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"
                }`}>
                  {product.badge}
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImageIndex ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={getImage(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{product.brand}</p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mt-1">{product.name}</h1>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-display text-3xl font-bold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {product.originalPrice && (
                <span className="text-sm font-semibold text-destructive">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Select Size (EU)</span>
                  {selectedSize && <span className="text-xs text-muted-foreground">Selected: EU {selectedSize}</span>}
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        selectedSize === size
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-card hover:border-accent/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center border border-border rounded-lg bg-card">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 hover:bg-secondary transition-colors rounded-l-lg">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-5 text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="p-3 hover:bg-secondary transition-colors rounded-r-lg">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button onClick={handleAddToCart} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2 h-12">
                <ShoppingBag className="h-5 w-5" />
                Add to Cart — {formatPrice(product.price * quantity)}
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-border">
              <div className="flex flex-col items-center text-center gap-1.5">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground leading-tight">Free Shipping<br />over €100</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground leading-tight">Authenticity<br />Guaranteed</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground leading-tight">30-Day<br />Returns</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <h2 className="font-display text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />

      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={images}
        initialIndex={currentImageIndex}
        productName={product.name}
      />
    </div>
  );
};

export default ProductDetail;
