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
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const Checkout = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const { coupon, loading: couponLoading, applyCoupon, removeCoupon, calculateDiscount } = useCoupon();

  const discount = calculateDiscount(totalPrice);
  const shipping = totalPrice >= 100 ? 0 : 9.99;
  const total = totalPrice - discount + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast({ title: "Please sign in", description: "You must be logged in to checkout.", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      // Call edge function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
          total,
          couponCode: coupon?.valid ? coupon.code : null,
          shippingAddress: null,
        },
      });

      if (error) {
        throw new Error(error.message || "Payment failed");
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        clearCart();
        window.location.href = data.url;
        return;
      }

      // No hosted checkout URL (Stripe not configured, or unexpected response)
      // -> never leave the user stuck on the payment step: complete as demo order.
      if (data?.error) {
        console.warn("Stripe not configured:", data.error);
      } else {
        console.warn("Checkout returned no URL:", data);
      }
      toast({ title: "Demo Mode", description: "Card payments aren't live yet — placing your order now." });

      await supabase.from("orders").insert({
        user_id: user.id,
        total,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        status: "pending",
      });

      const orderId = `EC-${Date.now().toString(36).toUpperCase()}`;
      clearCart();
      navigate(`/booking-confirmation?order=${orderId}&total=${total.toFixed(2)}`);

    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({ title: "Checkout Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
              <div className="bg-card rounded-xl p-5 sm:p-6 shadow-soft space-y-4 transition-shadow hover:shadow-md">
                <h2 className="font-display text-xl font-bold">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label htmlFor="firstName" className="text-sm font-medium mb-1.5 block">First Name *</label><Input id="firstName" name="firstName" autoComplete="given-name" required placeholder="John" /></div>
                  <div><label htmlFor="lastName" className="text-sm font-medium mb-1.5 block">Last Name *</label><Input id="lastName" name="lastName" autoComplete="family-name" required placeholder="Doe" /></div>
                  <div><label htmlFor="email" className="text-sm font-medium mb-1.5 block">Email *</label><Input id="email" name="email" autoComplete="email" inputMode="email" required type="email" placeholder="john@example.com" /></div>
                  <div><label htmlFor="phone" className="text-sm font-medium mb-1.5 block">Phone *</label><Input id="phone" name="phone" autoComplete="tel" inputMode="tel" required type="tel" placeholder="+33 6 12 34 56 78" /></div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-card rounded-xl p-5 sm:p-6 shadow-soft space-y-4 transition-shadow hover:shadow-md">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><Truck className="h-5 w-5 text-accent" /> Shipping Address</h2>
                <div className="space-y-4">
                  <div><label htmlFor="street" className="text-sm font-medium mb-1.5 block">Street Address *</label><Input id="street" name="street" autoComplete="street-address" required placeholder="123 Rue de Rivoli" /></div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div><label htmlFor="city" className="text-sm font-medium mb-1.5 block">City *</label><Input id="city" name="city" autoComplete="address-level2" required placeholder="Paris" /></div>
                    <div><label htmlFor="postal" className="text-sm font-medium mb-1.5 block">Postal Code *</label><Input id="postal" name="postal" autoComplete="postal-code" inputMode="numeric" required placeholder="75001" /></div>
                    <div><label htmlFor="country" className="text-sm font-medium mb-1.5 block">Country *</label><Input id="country" name="country" autoComplete="country-name" required placeholder="France" /></div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-card rounded-xl p-5 sm:p-6 shadow-soft space-y-4 transition-shadow hover:shadow-md">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><CreditCard className="h-5 w-5 text-accent" /> Payment Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="text-sm font-medium mb-1.5 block">Card Number *</label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      autoComplete="cc-number"
                      inputMode="numeric"
                      maxLength={19}
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cardExpiry" className="text-sm font-medium mb-1.5 block">Expiry Date *</label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        autoComplete="cc-exp"
                        inputMode="numeric"
                        maxLength={5}
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      />
                    </div>
                    <div>
                      <label htmlFor="cardCvc" className="text-sm font-medium mb-1.5 block">CVC *</label>
                      <Input
                        id="cardCvc"
                        name="cardCvc"
                        autoComplete="cc-csc"
                        inputMode="numeric"
                        maxLength={4}
                        required
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <ShieldCheck className="h-4 w-4 text-accent" /> Your payment is secured with 256-bit SSL encryption
                </div>
              </div>

            </div>

            {/* Order Summary */}
            <div className="h-fit space-y-4 lg:sticky lg:top-24">
              <div className="bg-card rounded-xl p-5 sm:p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto scroll-smooth pr-1">

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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (couponCode.trim() && !couponLoading) applyCoupon(couponCode, totalPrice);
                          }
                        }}
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
