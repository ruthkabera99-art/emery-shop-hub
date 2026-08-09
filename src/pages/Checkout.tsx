import { useState, useMemo, useCallback, memo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { getImage } from "@/lib/images";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Truck, ShieldCheck, Tag, X, Check, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useCoupon } from "@/hooks/useCoupon";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const luhnValid = (num: string) => {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return num.length >= 13 && sum % 10 === 0;
};

type Fields = {
  firstName: string; lastName: string; email: string; phone: string;
  street: string; city: string; postal: string; country: string;
  cardNumber: string; cardExpiry: string; cardCvc: string;
};

const initialFields: Fields = {
  firstName: "", lastName: "", email: "", phone: "",
  street: "", city: "", postal: "", country: "",
  cardNumber: "", cardExpiry: "", cardCvc: "",
};

const validateField = (name: keyof Fields, value: string): string => {
  const v = value.trim();
  switch (name) {
    case "firstName":
    case "lastName":
      return v.length < 2 ? "Please enter at least 2 characters" : "";
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter a valid email address";
    case "phone":
      return v.replace(/\D/g, "").length < 7 ? "Enter a valid phone number" : "";
    case "street":
      return v.length < 4 ? "Enter your street address" : "";
    case "city":
      return v.length < 2 ? "Enter your city" : "";
    case "postal":
      return v.length < 3 ? "Enter a valid postal code" : "";
    case "country":
      return v.length < 2 ? "Enter your country" : "";
    case "cardNumber":
      return luhnValid(v.replace(/\s/g, "")) ? "" : "Enter a valid card number";
    case "cardExpiry": {
      const m = v.match(/^(\d{2})\/(\d{2})$/);
      if (!m) return "Use MM/YY format";
      const month = Number(m[1]);
      const year = 2000 + Number(m[2]);
      if (month < 1 || month > 12) return "Invalid month";
      const end = new Date(year, month, 1);
      return end <= new Date() ? "Card has expired" : "";
    }
    case "cardCvc":
      return v.length < 3 ? "CVC must be 3–4 digits" : "";
    default:
      return "";
  }
};

interface FieldProps {
  id: keyof Fields;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength?: number;
  enterKeyHint?: "next" | "done";
  onChange: (id: keyof Fields, value: string) => void;
  onBlur: (id: keyof Fields) => void;
}

const Field = memo(({ id, label, value, error, placeholder, type = "text", autoComplete, inputMode, maxLength, enterKeyHint = "next", onChange, onBlur }: FieldProps) => (
  <div>
    <label htmlFor={id} className="text-sm font-medium mb-1.5 block">{label} *</label>
    <Input
      id={id}
      name={id}
      type={type}
      value={value}
      autoComplete={autoComplete}
      inputMode={inputMode}
      maxLength={maxLength}
      enterKeyHint={enterKeyHint}
      placeholder={placeholder}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      onChange={(e) => onChange(id, e.target.value)}
      onBlur={() => onBlur(id)}
      className={cn("h-12 text-base", error && "border-destructive focus-visible:ring-destructive")}
    />
    {error && (
      <p id={`${id}-error`} role="alert" className="text-xs text-destructive mt-1 flex items-center gap-1">
        <AlertCircle className="h-3 w-3 shrink-0" /> {error}
      </p>
    )}
  </div>
));
Field.displayName = "Field";

const Checkout = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [fields, setFields] = useState<Fields>(initialFields);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [payError, setPayError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const { coupon, loading: couponLoading, applyCoupon, removeCoupon, calculateDiscount } = useCoupon();

  const discount = calculateDiscount(totalPrice);
  const shipping = totalPrice >= 100 ? 0 : 9.99;
  const total = totalPrice - discount + shipping;

  useEffect(() => {
    if (items.length === 0) navigate("/cart", { replace: true });
  }, [items.length, navigate]);

  const handleChange = useCallback((id: keyof Fields, raw: string) => {
    let value = raw;
    if (id === "cardNumber") value = formatCardNumber(raw);
    if (id === "cardExpiry") value = formatExpiry(raw);
    if (id === "cardCvc") value = raw.replace(/\D/g, "").slice(0, 4);
    setFields((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => (prev[id] ? { ...prev, [id]: validateField(id, value) } : prev));
  }, []);

  const handleBlur = useCallback((id: keyof Fields) => {
    setFields((prev) => {
      setErrors((e) => ({ ...e, [id]: validateField(id, prev[id]) }));
      return prev;
    });
  }, []);

  const validateAll = useCallback(() => {
    const next: Partial<Record<keyof Fields, string>> = {};
    (Object.keys(initialFields) as (keyof Fields)[]).forEach((k) => {
      const err = validateField(k, fields[k]);
      if (err) next[k] = err;
    });
    setErrors(next);
    const firstBad = (Object.keys(next) as (keyof Fields)[])[0];
    if (firstBad) {
      const el = document.getElementById(firstBad);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLInputElement | null)?.focus({ preventScroll: true });
    }
    return !firstBad;
  }, [fields]);

  const placeOrder = useCallback(async () => {
    setPayError(null);
    if (!user) {
      setPayError("You need to be signed in to complete this order.");
      return;
    }
    setLoading(true);
    try {
      const payload = items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image }));
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { items: payload, total, couponCode: coupon?.valid ? coupon.code : null, shippingAddress: null },
      });

      if (error) throw new Error(error.message || "We couldn't reach the payment service.");

      if (data?.url) {
        clearCart();
        window.location.href = data.url;
        return;
      }

      toast({ title: "Demo Mode", description: "Card payments aren't live yet — placing your order now." });
      const shippingAddress = {
        name: `${fields.firstName} ${fields.lastName}`.trim(),
        email: fields.email,
        phone: fields.phone,
        street: fields.street,
        city: fields.city,
        postal: fields.postal,
        country: fields.country,
      };
      const { data: inserted } = await supabase
        .from("orders")
        .insert({ user_id: user.id, total, items: payload, status: "pending", shipping_address: shippingAddress })
        .select("id")
        .maybeSingle();
      const orderId = `EC-${Date.now().toString(36).toUpperCase()}`;
      clearCart();
      navigate(
        `/booking-confirmation?order=${orderId}&total=${total.toFixed(2)}${inserted?.id ? `&id=${inserted.id}` : ""}`
      );
    } catch (err: any) {
      setPayError(err?.message || "Payment failed. Please check your details and try again.");
      requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } finally {
      setLoading(false);
    }
  }, [user, items, total, coupon, clearCart, navigate, toast]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validateAll()) return;
    void placeOrder();
  }, [loading, validateAll, placeOrder]);

  const summaryItems = useMemo(
    () => items.map((item) => (
      <div key={item.id} className="flex items-center gap-3">
        <img src={getImage(item.image)} alt={item.name} loading="lazy" decoding="async" width={48} height={48} className="w-12 h-12 rounded-md object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
        </div>
        <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
      </div>
    )),
    [items]
  );

  if (items.length === 0) return null;

  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-6 sm:py-12 pb-28 lg:pb-12">
        <h1 className="font-display text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">Checkout</h1>

        <div aria-live="polite" className="sr-only">{loading ? "Processing your payment" : ""}</div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-10">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {payError && (
                <div ref={errorRef} role="alert" className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-start gap-2 flex-1">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">Payment couldn't be completed</p>
                      <p className="text-sm text-muted-foreground">{payError}</p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => void placeOrder()} className="shrink-0 h-11">
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Retry payment
                  </Button>
                </div>
              )}

              <div className="bg-card rounded-xl p-5 sm:p-6 shadow-soft space-y-4">
                <h2 className="font-display text-xl font-bold">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field id="firstName" label="First Name" value={fields.firstName} error={errors.firstName} autoComplete="given-name" placeholder="John" onChange={handleChange} onBlur={handleBlur} />
                  <Field id="lastName" label="Last Name" value={fields.lastName} error={errors.lastName} autoComplete="family-name" placeholder="Doe" onChange={handleChange} onBlur={handleBlur} />
                  <Field id="email" label="Email" value={fields.email} error={errors.email} type="email" inputMode="email" autoComplete="email" placeholder="john@example.com" onChange={handleChange} onBlur={handleBlur} />
                  <Field id="phone" label="Phone" value={fields.phone} error={errors.phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="+33 6 12 34 56 78" onChange={handleChange} onBlur={handleBlur} />
                </div>
              </div>

              <div className="bg-card rounded-xl p-5 sm:p-6 shadow-soft space-y-4">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><Truck className="h-5 w-5 text-accent" /> Shipping Address</h2>
                <div className="space-y-4">
                  <Field id="street" label="Street Address" value={fields.street} error={errors.street} autoComplete="street-address" placeholder="123 Rue de Rivoli" onChange={handleChange} onBlur={handleBlur} />
                  <div className="grid md:grid-cols-3 gap-4">
                    <Field id="city" label="City" value={fields.city} error={errors.city} autoComplete="address-level2" placeholder="Paris" onChange={handleChange} onBlur={handleBlur} />
                    <Field id="postal" label="Postal Code" value={fields.postal} error={errors.postal} inputMode="numeric" autoComplete="postal-code" placeholder="75001" onChange={handleChange} onBlur={handleBlur} />
                    <Field id="country" label="Country" value={fields.country} error={errors.country} autoComplete="country-name" placeholder="France" enterKeyHint="next" onChange={handleChange} onBlur={handleBlur} />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-5 sm:p-6 shadow-soft space-y-4">
                <h2 className="font-display text-xl font-bold flex items-center gap-2"><CreditCard className="h-5 w-5 text-accent" /> Payment Details</h2>
                <div className="space-y-4">
                  <Field id="cardNumber" label="Card Number" value={fields.cardNumber} error={errors.cardNumber} inputMode="numeric" autoComplete="cc-number" maxLength={19} placeholder="4242 4242 4242 4242" onChange={handleChange} onBlur={handleBlur} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field id="cardExpiry" label="Expiry Date" value={fields.cardExpiry} error={errors.cardExpiry} inputMode="numeric" autoComplete="cc-exp" maxLength={5} placeholder="MM/YY" onChange={handleChange} onBlur={handleBlur} />
                    <Field id="cardCvc" label="CVC" value={fields.cardCvc} error={errors.cardCvc} inputMode="numeric" autoComplete="cc-csc" maxLength={4} placeholder="123" enterKeyHint="done" onChange={handleChange} onBlur={handleBlur} />
                  </div>
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <ShieldCheck className="h-4 w-4 text-accent" /> Your payment is secured with 256-bit SSL encryption
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="h-fit space-y-4 lg:sticky lg:top-24">
              <div className="bg-card rounded-xl p-5 sm:p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto scroll-smooth pr-1">{summaryItems}</div>

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
                      <button type="button" aria-label="Remove promo code" onClick={removeCoupon} className="p-2 -mr-2">
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        aria-label="Promo code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (couponCode.trim() && !couponLoading) applyCoupon(couponCode, totalPrice);
                          }
                        }}
                        enterKeyHint="done"
                        placeholder="Enter code"
                        className="h-11 text-sm uppercase"
                      />
                      <Button type="button" variant="outline" disabled={!couponCode.trim() || couponLoading} onClick={() => applyCoupon(couponCode, totalPrice)} className="shrink-0 h-11">
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                  {coupon && !coupon.valid && <p role="alert" className="text-xs text-destructive mt-1">{coupon.message}</p>}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({totalItems} items)</span><span>{formatPrice(totalPrice)}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                  <div className="border-t border-border pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>{formatPrice(total)}</span></div>
                </div>
              </div>

              <div className="hidden lg:block">
                <Button type="submit" disabled={loading} aria-busy={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12 text-base">
                  {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing…</span> : `Book & Pay ${formatPrice(total)}`}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">Free shipping on orders over €100 · 30-day returns</p>
              </div>
            </div>
          </div>

          {/* Mobile sticky pay bar */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <Button type="submit" disabled={loading} aria-busy={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12 text-base">
              {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing…</span> : `Book & Pay ${formatPrice(total)}`}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
