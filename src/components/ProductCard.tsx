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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div className={`relative rounded-lg overflow-hidden bg-card shadow-soft hover:shadow-elevated transition-all duration-300 ${isOutOfStock ? "opacity-70" : ""}`}>
        <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden cursor-pointer">
          <OptimizedImage src={getImage(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </Link>
          {product.badge && !isOutOfStock && (
            <span className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
              product.badge === "Sale" ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"
            }`}>
              {product.badge}
            </span>
          )}
          {isLowStock && (
            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-orange-500 text-white flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Low Stock
            </span>
          )}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5">
            <Button
              size="icon"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
              className={`opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all h-8 w-8 sm:h-9 sm:w-9 rounded-full shadow-elevated ${
                wishlisted
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${wishlisted ? "fill-current" : ""}`} />
            </Button>
            {!isOutOfStock && (
              <Button
                size="icon"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-card text-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8 sm:h-9 sm:w-9 rounded-full shadow-elevated"
              >
                <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="pt-2 sm:pt-4 px-1">
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h3 className="font-medium text-xs sm:text-sm leading-tight line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-accent text-accent" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
            <span className="font-semibold text-sm sm:text-base">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
