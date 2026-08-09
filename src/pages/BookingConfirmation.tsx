import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Mail, ArrowRight, Printer, Truck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { getImage } from "@/lib/images";

const statusLabel: Record<string, string> = {
  pending: "Payment received — preparing your order",
  processing: "Being packed in our warehouse",
  shipped: "On its way to you",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const BookingConfirmation = () => {
  const [params] = useSearchParams();
  const orderRef = params.get("id");
  const orderId = params.get("order") || (orderRef ? orderRef.slice(0, 8).toUpperCase() : "EC-UNKNOWN");
  const totalParam = params.get("total") || "0.00";

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderRef],
    enabled: !!orderRef,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total, items, created_at, shipping_address")
        .eq("id", orderRef!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const items: any[] = Array.isArray(order?.items) ? (order!.items as any[]) : [];
  const total = order ? Number(order.total) : Number(totalParam);
  const status = order?.status || "pending";

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Order Confirmed | Emery Collection Shop"
        description="Your Emery Collection order is confirmed. View your receipt and track your delivery status."
      />
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-12 sm:py-20 print:py-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto"
        >
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring" }}>
              <CheckCircle2 className="h-16 w-16 sm:h-20 sm:w-20 text-green-500 mx-auto mb-5" />
            </motion.div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your order. Here's your receipt — a copy is on its way to your inbox.
            </p>
          </div>

          <div className="bg-card rounded-xl p-5 sm:p-6 shadow-soft text-left space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Receipt</p>
                <p className="font-mono font-bold">{orderId}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-accent/15 text-accent font-medium">
                {statusLabel[status] || status}
              </span>
            </div>

            {order?.created_at && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order date</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            )}

            {isLoading && orderRef && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading your receipt…
              </p>
            )}

            {items.length > 0 && (
              <div className="border-t border-border pt-4 space-y-3">
                {items.map((item, i) => (
                  <div key={`${item.id}-${i}`} className="flex items-center gap-3">
                    <img
                      src={getImage(item.image)}
                      alt={item.name}
                      loading="lazy"
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(Number(item.price) * Number(item.quantity))}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
              <span>Total paid</span>
              <span>{formatPrice(total)}</span>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-accent" />
                <span>Estimated delivery: 3–5 business days</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-accent" />
                <span>Confirmation email sent to your inbox</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Package className="h-4 w-4 text-accent" />
                <span>Tracking number will be sent once shipped</span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 print:hidden">
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 h-12">
              <Link to="/account">Track order status <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button variant="outline" className="h-12" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print receipt
            </Button>
            <Button asChild variant="ghost" className="sm:col-span-2 h-11">
              <Link to="/shop">Continue shopping</Link>
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingConfirmation;
