import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { products, testimonials } from "@/data/products";
import { getImage } from "@/lib/images";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, MessageSquare, Settings, Star, Euro, Users,
  TrendingUp, ArrowLeft, Trash2, Edit, Eye, Globe, Activity, Clock, Send, RefreshCw,
} from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "€24,580", icon: Euro, change: "+12%" },
  { label: "Orders", value: "342", icon: Package, change: "+8%" },
  { label: "Customers", value: "1,247", icon: Users, change: "+22%" },
  { label: "Avg. Rating", value: "4.8", icon: Star, change: "+0.2" },
];

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "visitors", label: "Visitors", icon: Eye },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "products", label: "Products", icon: Package },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

interface Visitor {
  id: string;
  session_id: string;
  page: string;
  country: string;
  device: string;
  browser: string;
  created_at: string;
}

interface Conversation {
  id: string;
  visitor_session_id: string;
  visitor_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// ── Visitor Stats Hook (real DB) ──
const useVisitorStats = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("visitors")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setVisitors(data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  // Subscribe to new visitors
  useEffect(() => {
    const channel = supabase
      .channel("admin-visitors")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitors" }, (payload) => {
        setVisitors((prev) => [payload.new as Visitor, ...prev.slice(0, 99)]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart); monthStart.setMonth(monthStart.getMonth() - 1);

  const totalToday = visitors.filter((v) => new Date(v.created_at) >= todayStart).length;
  const totalWeek = visitors.filter((v) => new Date(v.created_at) >= weekStart).length;
  const totalMonth = visitors.filter((v) => new Date(v.created_at) >= monthStart).length;

  return { visitors, totalToday, totalWeek, totalMonth, loading, refresh };
};

// ── Chat Hook (real DB) ──
const useAdminChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);

  // Load conversations
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });
      if (data) setConversations(data);
    };
    load();

    const channel = supabase
      .channel("admin-conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConv) { setMessages([]); return; }

    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConv)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    load();

    const channel = supabase
      .channel(`admin-msgs-${activeConv}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${activeConv}`,
      }, (payload) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === (payload.new as Message).id)) return prev;
          return [...prev, payload.new as Message];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConv]);

  const sendReply = async (content: string) => {
    if (!activeConv || !content.trim()) return;
    await supabase.from("messages").insert({
      conversation_id: activeConv,
      sender_type: "admin",
      content: content.trim(),
    });
  };

  return { conversations, messages, activeConv, setActiveConv, sendReply };
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const visitorStats = useVisitorStats();
  const chat = useAdminChat();
  const [replyInput, setReplyInput] = useState("");

  const handleSendReply = async () => {
    await chat.sendReply(replyInput);
    setReplyInput("");
  };

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
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.id === "chat" && chat.conversations.filter((c) => c.status === "open").length > 0 && (
                  <span className="ml-auto bg-accent text-accent-foreground text-xs rounded-full px-1.5 py-0.5">
                    {chat.conversations.filter((c) => c.status === "open").length}
                  </span>
                )}
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

          {/* ── DASHBOARD ── */}
          {activeTab === "dashboard" && (
            <div>
              <h1 className="font-display text-3xl font-bold mb-8">Dashboard</h1>
              <div className="bg-card rounded-lg p-4 shadow-soft mb-6 flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium">{visitorStats.totalToday} visitors today</span>
                <span className="ml-auto text-xs text-muted-foreground">From database</span>
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

          {/* ── VISITORS ── */}
          {activeTab === "visitors" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl font-bold">Visitor Tracking</h1>
                <Button variant="outline" size="sm" onClick={visitorStats.refresh} disabled={visitorStats.loading}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${visitorStats.loading ? "animate-spin" : ""}`} /> Refresh
                </Button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-card rounded-lg p-5 shadow-soft">
                  <Clock className="h-5 w-5 text-accent mb-2" />
                  <p className="text-3xl font-bold">{visitorStats.totalToday}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
                <div className="bg-card rounded-lg p-5 shadow-soft">
                  <Eye className="h-5 w-5 text-accent mb-2" />
                  <p className="text-3xl font-bold">{visitorStats.totalWeek}</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
                <div className="bg-card rounded-lg p-5 shadow-soft">
                  <Globe className="h-5 w-5 text-accent mb-2" />
                  <p className="text-3xl font-bold">{visitorStats.totalMonth}</p>
                  <p className="text-xs text-muted-foreground">This Month</p>
                </div>
              </div>

              <div className="bg-card rounded-lg shadow-soft overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">Recent Visitors</h2>
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
                        {["Time", "Page", "Device", "Browser"].map((h) => (
                          <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visitorStats.visitors.map((v) => (
                        <tr key={v.id} className="border-t border-border">
                          <td className="p-3 text-muted-foreground text-xs">{new Date(v.created_at).toLocaleString()}</td>
                          <td className="p-3 font-mono text-xs">{v.page}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${v.device === "Mobile" ? "bg-blue-100 text-blue-700" : v.device === "Desktop" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>
                              {v.device}
                            </span>
                          </td>
                          <td className="p-3 text-xs">{v.browser}</td>
                        </tr>
                      ))}
                      {visitorStats.visitors.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No visitors tracked yet. Visit the store to see data appear here.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── CHAT ── */}
          {activeTab === "chat" && (
            <div>
              <h1 className="font-display text-3xl font-bold mb-8">Live Chat</h1>
              <div className="flex gap-4 h-[calc(100vh-200px)]">
                {/* Conversation list */}
                <div className="w-72 bg-card rounded-lg shadow-soft overflow-hidden flex flex-col shrink-0">
                  <div className="p-4 border-b border-border">
                    <p className="text-sm font-semibold">Conversations</p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {chat.conversations.length === 0 && (
                      <p className="p-4 text-sm text-muted-foreground text-center">No conversations yet</p>
                    )}
                    {chat.conversations.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => chat.setActiveConv(c.id)}
                        className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors ${chat.activeConv === c.id ? "bg-muted" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{c.visitor_name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${c.status === "open" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(c.updated_at).toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 bg-card rounded-lg shadow-soft overflow-hidden flex flex-col">
                  {!chat.activeConv ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <p className="text-sm">Select a conversation to start replying</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 border-b border-border">
                        <p className="text-sm font-semibold">
                          {chat.conversations.find((c) => c.id === chat.activeConv)?.visitor_name || "Visitor"}
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {chat.messages.map((m) => (
                          <div key={m.id} className={`flex ${m.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                              m.sender_type === "admin"
                                ? "bg-accent text-accent-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            }`}>
                              {m.content}
                              <p className="text-[10px] opacity-60 mt-1">
                                {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-border flex gap-2">
                        <Input
                          placeholder="Type a reply..."
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                          className="text-sm"
                        />
                        <Button size="icon" onClick={handleSendReply} className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ── */}
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

          {/* ── REVIEWS ── */}
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

          {/* ── SETTINGS ── */}
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
