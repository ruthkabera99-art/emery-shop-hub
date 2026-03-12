import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { getImage } from "@/lib/images";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Truck, ShieldCheck, Tag, X, Check } from "lucide-react";
import { useCoupon } from "@/hooks/useCoupon";

const Checkout = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const { coupon, loading: couponLoading, applyCoupon, removeCoupon, calculateDiscount } = useCoupon();

  const discount = calculateDiscount(totalPrice);
  const shipping = totalPrice >= 100 ? 0 : 9.99;
  const total = totalPrice - discount + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const orderId = `EC-${Date.now().toString(36).toUpperCase()}`;
      clearCart();
      navigate(`/booking-confirmation?order=${orderId}&total=${total.toFixed(2)}`);
    }, 1500);
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-6 sm:py-12">
        <h1 className="font-display text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-10">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact */}
              <div className="bg-card rounded-lg p-6 shadow-soft space-y-4">
                <h2 className="font-display text-xl font-bold">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">First Name *</label><Input required placeholder="John" /></div>
                  <div><label className="text-sm font-medium mb-1 block">Last Name *</label><Input required placeholder="Doe" /></div>
                  <div><label className="text-sm font-medium mb-1 block">Email *</label><Input required type="email" placeholder="john@example.com" /></div>
                  <div><label className="text-sm font-medium mb-1 block">Phone *</label><Input required type="tel" placeholder="+33 6 12 34 56 78" /></div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-card rounded-lg p-6 shadow-soft space-y-4">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><Truck className="h-5 w-5 text-accent" /> Shipping Address</h2>
                <div className="space-y-4">
                  <div><label className="text-sm font-medium mb-1 block">Street Address *</label><Input required placeholder="123 Rue de Rivoli" /></div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div><label className="text-sm font-medium mb-1 block">City *</label><Input required placeholder="Paris" /></div>
                    <div><label className="text-sm font-medium mb-1 block">Postal Code *</label><Input required placeholder="75001" /></div>
                    <div><label className="text-sm font-medium mb-1 block">Country *</label><Input required placeholder="France" /></div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-card rounded-lg p-6 shadow-soft space-y-4">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><CreditCard className="h-5 w-5 text-accent" /> Payment Details</h2>
                <div className="space-y-4">
                  <div><label className="text-sm font-medium mb-1 block">Card Number *</label><Input required placeholder="4242 4242 4242 4242" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium mb-1 block">Expiry Date *</label><Input required placeholder="MM/YY" /></div>
                    <div><label className="text-sm font-medium mb-1 block">CVC *</label><Input required placeholder="123" /></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" /> Your payment is secured with 256-bit SSL encryption
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="h-fit space-y-4">
              <div className="bg-card rounded-lg p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={getImage(item.image)} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code */}
                <div className="border-t border-border pt-4 mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Promo Code
                  </p>
                  {coupon?.valid ? (
                    <div className="flex items-center justify-between bg-accent/10 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{coupon.code}</span>
                        <span className="text-xs text-green-600">{coupon.message}</span>
                      </div>
                      <button type="button" onClick={removeCoupon}>
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="text-sm uppercase"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!couponCode.trim() || couponLoading}
                        onClick={() => applyCoupon(couponCode, totalPrice)}
                        className="shrink-0"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </Button>
                    </div>
                  )}
                  {coupon && !coupon.valid && (
                    <p className="text-xs text-destructive mt-1">{coupon.message}</p>
                  )}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({totalItems} items)</span><span>{formatPrice(totalPrice)}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span><span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                  <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12 text-base">
                {loading ? "Processing..." : `Book & Pay ${formatPrice(total)}`}
              </Button>
              <p className="text-xs text-center text-muted-foreground">Free shipping on orders over €100 · 30-day returns</p>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
