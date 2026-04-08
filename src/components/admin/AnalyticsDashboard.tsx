
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, ShoppingBag, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const CHART_COLORS = [
  "hsl(38, 60%, 55%)",
  "hsl(30, 10%, 35%)",
  "hsl(200, 60%, 50%)",
  "hsl(150, 50%, 45%)",
  "hsl(350, 60%, 55%)",
];

const AnalyticsDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refresh = async () => {
    setLoading(true);
    const [ordersRes, visitorsRes, productsRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("visitors").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("products").select("*"),
    ]);
    setOrders(ordersRes.data || []);
    setVisitors(visitorsRes.data || []);
    setProducts(productsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  // Revenue stats
  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = activeOrders.reduce((a, o) => a + Number(o.total), 0);
  const avgOrderValue = activeOrders.length ? totalRevenue / activeOrders.length : 0;

  // Revenue by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const revenueByDay = last7Days.map((day) => ({
    day: new Date(day).toLocaleDateString("en", { weekday: "short" }),
    revenue: activeOrders
      .filter((o) => o.created_at.slice(0, 10) === day)
      .reduce((a, o) => a + Number(o.total), 0),
    orders: activeOrders.filter((o) => o.created_at.slice(0, 10) === day).length,
  }));

  // Visitors by day
  const visitorsByDay = last7Days.map((day) => ({
    day: new Date(day).toLocaleDateString("en", { weekday: "short" }),
    visitors: visitors.filter((v) => v.created_at.slice(0, 10) === day).length,
  }));

  // Order status distribution
  const statusDist = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const statusData = Object.entries(statusDist).map(([name, value]) => ({ name, value }));

  // Top categories
  const categoryRevenue: Record<string, number> = {};
  activeOrders.forEach((o) => {
    if (Array.isArray(o.items)) {
      o.items.forEach((item: any) => {
        const cat = item.category || "Other";
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.price || 0) * (item.quantity || 1);
      });
    }
  });
  const categoryData = Object.entries(categoryRevenue)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Device breakdown
  const deviceDist = visitors.reduce((acc, v) => {
    acc[v.device || "Unknown"] = (acc[v.device || "Unknown"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const deviceData = Object.entries(deviceDist).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign, sub: `${activeOrders.length} orders` },
          { label: "Avg Order Value", value: formatPrice(avgOrderValue), icon: TrendingUp, sub: "per order" },
          { label: "Total Products", value: products.length, icon: ShoppingBag, sub: `${products.filter((p) => p.in_stock).length} in stock` },
          { label: "Total Visitors", value: visitors.length, icon: Users, sub: "last 500 tracked" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-lg p-5 shadow-soft">
            <s.icon className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-lg p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold mb-4">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatPrice(v)} />
              <Bar dataKey="revenue" fill="hsl(38, 60%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold mb-4">Visitors (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={visitorsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" stroke="hsl(38, 60%, 55%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold mb-4">Order Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No orders yet</p>
          )}
        </div>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold mb-4">Visitors by Device</h3>
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {deviceData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No visitor data</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
