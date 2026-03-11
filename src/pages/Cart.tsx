import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { getImage } from "@/lib/images";
import { formatPrice } from "@/lib/currency";
import OptimizedImage from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const shipping = totalPrice >= 100 ? 0 : 9.99;
  const total = totalPrice + shipping;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="font-display text-4xl font-bold mb-8">Shopping Cart</h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-6">Your cart is empty</p>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-10">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 sm:gap-4 bg-card rounded-lg p-3 sm:p-4 shadow-soft">
                  <img src={getImage(item.image)} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md" />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-md hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-md hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-auto p-1 text-destructive hover:bg-destructive/10 rounded-md"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-lg p-6 shadow-soft h-fit">
              <h2 className="font-display text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between"><span className="text-muted-foreground">Items ({totalItems})</span><span>{formatPrice(totalPrice)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>
              <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">Free shipping on orders over €100</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
