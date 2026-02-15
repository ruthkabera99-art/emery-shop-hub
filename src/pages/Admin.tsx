import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { products, testimonials } from "@/data/products";
import { getImage } from "@/lib/images";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutDashboard, Package, MessageSquare, Settings, Star, Euro, Users, TrendingUp, ArrowLeft, Trash2, Edit, Eye, Globe, Activity, Clock } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "€24,580", icon: Euro, change: "+12%" },
  { label: "Orders", value: "342", icon: Package, change: "+8%" },
  { label: "Customers", value: "1,247", icon: Users, change: "+22%" },
  { label: "Avg. Rating", value: "4.8", icon: Star, change: "+0.2" },
];

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "visitors", label: "Visitors", icon: Eye },
  { id: "products", label: "Products", icon: Package },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

// Simulated visitor tracking (replace with real backend when Cloud is enabled)
const useVisitorTracker = () => {
  const [onlineNow, setOnlineNow] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [totalWeek, setTotalWeek] = useState(0);
  const [totalMonth, setTotalMonth] = useState(0);
  const [recentVisitors, setRecentVisitors] = useState<{ time: string; page: string; country: string; device: string }[]>([]);
  const [hourlyData, setHourlyData] = useState<{ hour: string; visitors: number }[]>([]);

  useEffect(() => {
    // Simulate initial data
    const baseOnline = Math.floor(Math.random() * 15) + 3;
    setOnlineNow(baseOnline);
    setTotalToday(Math.floor(Math.random() * 200) + 80);
    setTotalWeek(Math.floor(Math.random() * 1200) + 500);
    setTotalMonth(Math.floor(Math.random() * 4500) + 2000);

    const countries = ["France", "Germany", "Netherlands", "Italy", "Spain", "UK", "Belgium", "Portugal", "Sweden", "Poland"];
    const pages = ["/", "/shop", "/shop?cat=mens", "/shop?cat=womens", "/cart", "/about", "/contact", "/shop?cat=kids", "/shop?cat=sports", "/shop?cat=sale"];
    const devices = ["Mobile", "Desktop", "Tablet"];

    const initialVisitors = Array.from({ length: 20 }, (_, i) => ({
      time: `${Math.floor(Math.random() * 60)}m ago`,
      page: pages[Math.floor(Math.random() * pages.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
    }));
    setRecentVisitors(initialVisitors);

    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, "0")}:00`,
      visitors: Math.floor(Math.random() * 30) + 2,
    }));
    setHourlyData(hours);

    // Simulate live updates
    const interval = setInterval(() => {
      setOnlineNow((prev) => Math.max(1, prev + (Math.random() > 0.5 ? 1 : -1)));
      setTotalToday((prev) => prev + (Math.random() > 0.7 ? 1 : 0));
      if (Math.random() > 0.6) {
        setRecentVisitors((prev) => [
          {
            time: "Just now",
            page: pages[Math.floor(Math.random() * pages.length)],
            country: countries[Math.floor(Math.random() * countries.length)],
            device: devices[Math.floor(Math.random() * devices.length)],
          },
          ...prev.slice(0, 19),
        ]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return { onlineNow, totalToday, totalWeek, totalMonth, recentVisitors, hourlyData };
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const visitors = useVisitorTracker();

  return (
    <div className="min-h-screen bg-muted">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-primary text-primary-foreground p-6 hidden lg:block">
          <Link to="/" className="font-display text-lg font-bold mb-8 block">EMERY ADMIN</Link>
          <nav className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === t.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-sidebar-accent/50"}`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </nav>
          <Link to="/" className="flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-primary-foreground mt-10">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </aside>

        {/* Main */}
        <div className="flex-1 p-6 lg:p-10">
          {/* Mobile tabs */}
          <div className="flex gap-2 mb-6 lg:hidden overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === t.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          {activeTab === "dashboard" && (
            <div>
              <h1 className="font-display text-3xl font-bold mb-8">Dashboard</h1>

              {/* Live Online Badge */}
              <div className="bg-card rounded-lg p-4 shadow-soft mb-6 flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium">{visitors.onlineNow} visitors online right now</span>
                <span className="ml-auto text-xs text-muted-foreground">Updated live</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {stats.map((s) => (
                  <div key={s.label} className="bg-card rounded-lg p-5 shadow-soft">
                    <div className="flex items-center justify-between mb-2">
                      <s.icon className="h-5 w-5 text-accent" />
                      <span className="text-xs font-medium text-green-600 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{s.change}</span>
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <h2 className="font-display text-xl font-bold mb-4">Recent Orders</h2>
              <div className="bg-card rounded-lg shadow-soft overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted"><tr>{["Order", "Customer", "Product", "Amount", "Status"].map((h) => <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                  <tbody>
                    {[
                      { id: "#1247", customer: "Sarah M.", product: "Jordan 1 Retro High OG", amount: "€179.00", status: "Delivered" },
                      { id: "#1246", customer: "James K.", product: "Jordan 4 Retro Bred", amount: "€229.00", status: "Shipped" },
                      { id: "#1245", customer: "Emily R.", product: "Air Max Volt Runner", amount: "€219.00", status: "Processing" },
                      { id: "#1244", customer: "Luca F.", product: "Adidas Samba OG Cream", amount: "€109.00", status: "Delivered" },
                      { id: "#1243", customer: "Anna B.", product: "New Balance 550", amount: "€129.00", status: "Shipped" },
                    ].map((o) => (
                      <tr key={o.id} className="border-t border-border">
                        <td className="p-3 font-medium">{o.id}</td>
                        <td className="p-3">{o.customer}</td>
                        <td className="p-3">{o.product}</td>
                        <td className="p-3">{o.amount}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${o.status === "Delivered" ? "bg-green-100 text-green-700" : o.status === "Shipped" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "visitors" && (
            <div>
              <h1 className="font-display text-3xl font-bold mb-8">Visitor Tracking</h1>

              {/* Live Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-card rounded-lg p-5 shadow-soft">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{visitors.onlineNow}</p>
                  <p className="text-xs text-muted-foreground">Online Now</p>
                </div>
                <div className="bg-card rounded-lg p-5 shadow-soft">
                  <Clock className="h-5 w-5 text-accent mb-2" />
                  <p className="text-3xl font-bold">{visitors.totalToday}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
                <div className="bg-card rounded-lg p-5 shadow-soft">
                  <Eye className="h-5 w-5 text-accent mb-2" />
                  <p className="text-3xl font-bold">{visitors.totalWeek.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
                <div className="bg-card rounded-lg p-5 shadow-soft">
                  <Globe className="h-5 w-5 text-accent mb-2" />
                  <p className="text-3xl font-bold">{visitors.totalMonth.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">This Month</p>
                </div>
              </div>

              {/* Hourly Traffic */}
              <div className="bg-card rounded-lg p-6 shadow-soft mb-8">
                <h2 className="font-display text-lg font-bold mb-4">Today's Traffic (Hourly)</h2>
                <div className="flex items-end gap-1 h-32">
                  {visitors.hourlyData.map((h, i) => {
                    const maxVal = Math.max(...visitors.hourlyData.map((d) => d.visitors));
                    const height = maxVal > 0 ? (h.visitors / maxVal) * 100 : 0;
                    const currentHour = new Date().getHours();
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-8 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {h.hour}: {h.visitors}
                        </div>
                        <div
                          className={`w-full rounded-t transition-all ${i === currentHour ? "bg-accent" : "bg-accent/30"}`}
                          style={{ height: `${height}%`, minHeight: "2px" }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
                </div>
              </div>

              {/* Live Visitor Feed */}
              <div className="bg-card rounded-lg shadow-soft overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">Live Visitor Feed</h2>
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        {["Time", "Page", "Country", "Device"].map((h) => (
                          <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visitors.recentVisitors.map((v, i) => (
                        <tr key={i} className={`border-t border-border ${i === 0 && v.time === "Just now" ? "bg-accent/5" : ""}`}>
                          <td className="p-3 text-muted-foreground">{v.time}</td>
                          <td className="p-3 font-mono text-xs">{v.page}</td>
                          <td className="p-3">{v.country}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${v.device === "Mobile" ? "bg-blue-100 text-blue-700" : v.device === "Desktop" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>
                              {v.device}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                ⚠️ Visitor data is simulated. Enable Lovable Cloud for real tracking with analytics.
              </p>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl font-bold">Products ({products.length})</h1>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">+ Add Product</Button>
              </div>
              <div className="grid gap-4">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 bg-card rounded-lg p-4 shadow-soft">
                    <img src={getImage(p.image)} alt={p.name} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <h3 className="font-medium">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">{p.brand} · {p.category} · {formatPrice(p.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8"><Edit className="h-3 w-3" /></Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h1 className="font-display text-3xl font-bold mb-8">Customer Reviews</h1>
              <div className="grid gap-4">
                {testimonials.map((t, i) => (
                  <div key={i} className="bg-card rounded-lg p-5 shadow-soft">
                    <div className="flex items-center gap-1 mb-2">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-accent text-accent" />)}</div>
                    <p className="text-sm mb-3">"{t.text}"</p>
                    <p className="text-sm font-medium">{t.name} <span className="text-muted-foreground font-normal">· {t.location}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h1 className="font-display text-3xl font-bold mb-8">Settings</h1>
              <div className="bg-card rounded-lg p-6 shadow-soft max-w-lg space-y-4">
                <div><label className="text-sm font-medium mb-1 block">Store Name</label><Input defaultValue="Emery Collection Shop" /></div>
                <div><label className="text-sm font-medium mb-1 block">Contact Email</label><Input defaultValue="hello@emerycollection.com" /></div>
                <div><label className="text-sm font-medium mb-1 block">Currency</label><Input defaultValue="EUR (€)" /></div>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
