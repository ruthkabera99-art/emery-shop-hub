import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, Package, Heart, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const [tab, setTab] = useState<"orders" | "wishlist">("orders");

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*, products(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const tabs = [
    { key: "orders" as const, label: "Orders", icon: Package, count: orders.length },
    { key: "wishlist" as const, label: "Wishlist", icon: Heart, count: wishlist.length },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                <User className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">
                  {user.user_metadata?.full_name || "My Account"}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.count > 0 && (
                  <span className="bg-background/30 text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Orders Tab */}
          {tab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl shadow-soft">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">Start shopping to see your orders here.</p>
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to="/shop">Browse Shop</Link>
                  </Button>
                </div>
              ) : (
                orders.map((order: any) => (
                  <div key={order.id} className="bg-card rounded-xl shadow-soft p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</span>
                        <p className="font-semibold">{formatPrice(order.total)}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        order.status === "delivered" ? "bg-green-100 text-green-700" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {tab === "wishlist" && (
            <div className="space-y-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl shadow-soft">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2">Your Wishlist is Empty</h3>
                  <p className="text-sm text-muted-foreground mb-6">Save products you love for later.</p>
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to="/shop">Browse Shop</Link>
                  </Button>
                </div>
              ) : (
                wishlist.map((item: any) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.product_id}`}
                    className="flex items-center gap-4 bg-card rounded-xl shadow-soft p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="h-16 w-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                      {item.products?.images?.[0] && (
                        <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.products?.name}</p>
                      <p className="text-sm font-semibold text-accent">{formatPrice(item.products?.price || 0)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                ))
              )}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
