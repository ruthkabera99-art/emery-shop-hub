import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Mail, ArrowRight } from "lucide-react";

const BookingConfirmation = () => {
  const [params] = useSearchParams();
  const orderId = params.get("order") || "EC-UNKNOWN";
  const total = params.get("total") || "0.00";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
          </motion.div>
          <h1 className="font-display text-4xl font-bold mb-3">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-lg mb-8">Thank you for your order. Your shoes are being prepared.</p>

          <div className="bg-card rounded-lg p-6 shadow-soft text-left space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <span className="font-mono font-bold">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Paid</span>
              <span className="font-bold text-lg">€{total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated Delivery</span>
              <span className="font-medium">3-5 Business Days</span>
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-accent" />
                <span>Confirmation email sent to your inbox</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Package className="h-4 w-4 text-accent" />
                <span>Tracking number will be sent when shipped</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/shop">Continue Shopping <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingConfirmation;
