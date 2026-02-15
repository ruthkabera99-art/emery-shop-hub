import { Star, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { getImage } from "@/lib/images";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div className="relative rounded-lg overflow-hidden bg-card shadow-soft hover:shadow-elevated transition-all duration-300">
        <div className="aspect-square overflow-hidden">
          <img src={getImage(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        </div>
        {product.badge && (
          <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${
            product.badge === "Sale" ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"
          }`}>
            {product.badge}
          </span>
        )}
        <Button
          size="icon"
          onClick={() => addToCart(product)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-card text-foreground hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-full shadow-elevated"
        >
          <ShoppingBag className="h-4 w-4" />
        </Button>
      </div>
      <div className="pt-4 px-1">
        <h3 className="font-medium text-sm">{product.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
