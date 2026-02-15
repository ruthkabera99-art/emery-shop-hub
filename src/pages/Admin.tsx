import { useState } from "react";
import { Link } from "react-router-dom";
import { products, testimonials } from "@/data/products";
import { getImage } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutDashboard, Package, MessageSquare, Settings, Star, Euro, Users, TrendingUp, ArrowLeft, Trash2, Edit } from "lucide-react";
import { formatPrice } from "@/lib/currency";

const stats = [
  { label: "Total Revenue", value: "€24,580", icon: Euro, change: "+12%" },
  { label: "Orders", value: "342", icon: Package, change: "+8%" },
  { label: "Customers", value: "1,247", icon: Users, change: "+22%" },
  { label: "Avg. Rating", value: "4.8", icon: Star, change: "+0.2" },
];

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

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

          {activeTab === "products" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl font-bold">Products</h1>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">+ Add Product</Button>
              </div>
              <div className="grid gap-4">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 bg-card rounded-lg p-4 shadow-soft">
                    <img src={getImage(p.image)} alt={p.name} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <h3 className="font-medium">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">{p.category} · {formatPrice(p.price)}</p>
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
