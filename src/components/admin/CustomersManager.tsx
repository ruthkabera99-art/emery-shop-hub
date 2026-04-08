
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Users, Search, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomerProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  orderCount: number;
  totalSpent: number;
}

const CustomersManager = () => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const refresh = async () => {
    setLoading(true);
    const [profilesRes, ordersRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("user_id, total, status"),
    ]);

    if (profilesRes.error) {
      toast({ title: "Error", description: profilesRes.error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const ordersByUser: Record<string, { count: number; total: number }> = {};
    (ordersRes.data || []).forEach((o: any) => {
      if (o.status !== "cancelled") {
        if (!ordersByUser[o.user_id]) ordersByUser[o.user_id] = { count: 0, total: 0 };
        ordersByUser[o.user_id].count++;
        ordersByUser[o.user_id].total += Number(o.total);
      }
    });

    const enriched = (profilesRes.data || []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      created_at: p.created_at,
      orderCount: ordersByUser[p.id]?.count || 0,
      totalSpent: ordersByUser[p.id]?.total || 0,
    }));

    setCustomers(enriched);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const filtered = customers.filter((c) =>
    (c.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.orderCount > 0).length;
  const totalLifetimeValue = customers.reduce((a, c) => a + c.totalSpent, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Customers ({totalCustomers})</h1>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Customers", value: totalCustomers, icon: Users },
          { label: "Active Buyers", value: activeCustomers, icon: ShoppingBag },
          { label: "Total Revenue", value: formatPrice(totalLifetimeValue), icon: ShoppingBag },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-lg p-5 shadow-soft">
            <s.icon className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-lg shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {["Customer", "Joined", "Orders", "Total Spent"].map((h) => (
                <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                      {(c.full_name || "?")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.full_name || "No name"}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{c.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.orderCount > 0 ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {c.orderCount} orders
                  </span>
                </td>
                <td className="p-3 font-medium">{formatPrice(c.totalSpent)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No customers found</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersManager;
