import { Star, ShoppingBag, AlertTriangle, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { getImage } from "@/lib/images";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/OptimizedImage";

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isOutOfStock = product.inStock === false;
  const isLowStock = !isOutOfStock && product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity <= 5;
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group"
    >
      <div className={`relative rounded-2xl overflow-hidden bg-card shadow-soft hover:shadow-elevated transition-all duration-500 ${isOutOfStock ? "opacity-60 saturate-50" : ""}`}>
        <Link to={`/product/${product.id}`} className="block aspect-[3/4] overflow-hidden cursor-pointer">
          <OptimizedImage src={getImage(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-foreground text-background px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </Link>
        {product.badge && !isOutOfStock && (
          <span className={`absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
            product.badge === "Sale" ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"
          }`}>
            {product.badge}
          </span>
        )}
        {isLowStock && (
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-orange-500 text-white flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Low Stock
          </span>
        )}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-2">
          <Button
            size="icon"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
            className={`opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 h-9 w-9 sm:h-10 sm:w-10 rounded-full shadow-lg backdrop-blur-sm ${
              wishlisted
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-card/90 text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
          </Button>
          {!isOutOfStock && (
            <Button
              size="icon"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
              className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 bg-card/90 text-foreground hover:bg-accent hover:text-accent-foreground h-9 w-9 sm:h-10 sm:w-10 rounded-full shadow-lg backdrop-blur-sm"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="pt-3 sm:pt-4 px-1">
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{product.brand}</p>
        <h3 className="font-medium text-sm sm:text-base leading-tight line-clamp-2 mt-0.5">{product.name}</h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, j) => (
              <Star key={j} className={`h-3 w-3 ${j < Math.round(product.rating) ? "fill-accent text-accent" : "fill-muted text-muted"}`} />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-base sm:text-lg">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
