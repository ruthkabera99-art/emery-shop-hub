import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { products as initialProducts, testimonials as initialTestimonials, Product } from "@/data/products";
import { getImage, imageMap } from "@/lib/images";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard, Package, MessageSquare, Settings, Star, Euro, Users,
  TrendingUp, ArrowLeft, Trash2, Edit, Eye, Globe, Clock, Send, RefreshCw,
  Plus, Search, X, Save, Check, Palette, FileText, Menu as MenuIcon, Layout, ImageIcon,
  ShoppingBag, Tag, BarChart3, CheckCircle, XCircle, ShieldCheck,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import ThemeCustomizer from "@/components/admin/ThemeCustomizer";
import FooterEditor from "@/components/admin/FooterEditor";
import MenuEditor from "@/components/admin/MenuEditor";
import HomepageEditor from "@/components/admin/HomepageEditor";
import HeroBannerEditor from "@/components/admin/HeroBannerEditor";
import OrdersManager from "@/components/admin/OrdersManager";
import CouponsManager from "@/components/admin/CouponsManager";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import CustomersManager from "@/components/admin/CustomersManager";
import RolesManager from "@/components/admin/RolesManager";
import { useAdminRole } from "@/hooks/useAdminRole";

// ── Types ──
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

interface DbProduct {
  id: string;
  name: string;
  price: number;
  brand: string;
  category: string;
  description: string;
  images: string[];
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  badge: string | null;
  created_at: string;
  updated_at: string;
}

interface DbReview {
  id: string;
  product_id: string | null;
  customer_name: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
}

interface SettingsData {
  storeName: string;
  contactEmail: string;
  currency: string;
  phone: string;
  address: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeEnabled: string;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "visitors", label: "Visitors", icon: Eye },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "hero", label: "Hero Banner", icon: ImageIcon },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "footer", label: "Footer", icon: FileText },
  { id: "menu", label: "Menu", icon: MenuIcon },
  { id: "homepage", label: "Homepage", icon: Layout },
  { id: "roles", label: "Roles", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

const IMAGE_OPTIONS = Object.keys(imageMap);
const CATEGORIES = ["mens", "womens", "kids", "sports", "sale"];

const defaultSettings: SettingsData = {
  storeName: "Emery Collection Shop",
  contactEmail: "hello@emerycollection.com",
  currency: "EUR (€)",
  phone: "+250 788 000 000",
  address: "Kigali, Rwanda",
  stripePublishableKey: "",
  stripeSecretKey: "",
  stripeEnabled: "false",
};

// ── Visitor Stats Hook ──
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

  return {
    visitors,
    totalToday: visitors.filter((v) => new Date(v.created_at) >= todayStart).length,
    totalWeek: visitors.filter((v) => new Date(v.created_at) >= weekStart).length,
    totalMonth: visitors.filter((v) => new Date(v.created_at) >= monthStart).length,
    loading,
    refresh,
  };
};

// ── Chat Hook ──
const useAdminChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);

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

  const closeConversation = async (convId: string) => {
    await supabase
      .from("conversations")
      .update({ status: "closed" })
      .eq("id", convId);
    if (activeConv === convId) setActiveConv(null);
  };

  return { conversations, messages, activeConv, setActiveConv, sendReply, closeConversation };
};

// ── Products Hook (Supabase) ──
const useAdminProducts = () => {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
    if (error) toast({ title: "Error loading products", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const addProduct = async (product: Partial<DbProduct>) => {
    const { error } = await supabase.from("products").insert({
      name: product.name || "",
      price: product.price || 0,
      brand: product.brand || "",
      category: product.category || "mens",
      description: product.description || "",
      images: product.images || [],
      rating: product.rating || 0,
      reviews_count: product.reviews_count || 0,
      in_stock: product.in_stock ?? true,
      badge: product.badge || null,
      stock_quantity: (product as any).stock_quantity ?? 50,
    });
    if (error) {
      toast({ title: "Error adding product", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Product Added", description: `${product.name} has been added.` });
    await refresh();
    return true;
  };

  const updateProduct = async (id: string, product: Partial<DbProduct>) => {
    const { error } = await supabase.from("products").update({
      name: product.name,
      price: product.price,
      brand: product.brand,
      category: product.category,
      description: product.description,
      images: product.images,
      rating: product.rating,
      reviews_count: product.reviews_count,
      in_stock: product.in_stock,
      badge: product.badge || null,
      stock_quantity: (product as any).stock_quantity ?? 50,
    }).eq("id", id);
    if (error) {
      toast({ title: "Error updating product", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Product Updated", description: `${product.name} has been updated.` });
    await refresh();
    return true;
  };

  const deleteProduct = async (id: string) => {
    const p = products.find((x) => x.id === id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Product Deleted", description: `${p?.name || "Product"} has been removed.` });
    await refresh();
    return true;
  };

  const seedProducts = async () => {
    // Delete existing seeded products first, then re-insert with badges
    await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const dbProducts = initialProducts.map((p) => ({
      name: p.name,
      price: p.price,
      brand: p.brand,
      category: p.category,
      description: "",
      images: [p.image],
      rating: p.rating,
      reviews_count: p.reviews,
      in_stock: true,
      badge: p.badge || null,
    }));
    const { error } = await supabase.from("products").insert(dbProducts);
    if (error) {
      toast({ title: "Error seeding products", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Products Seeded", description: `${dbProducts.length} products added with badges.` });
    await refresh();
  };

  return { products, loading, refresh, addProduct, updateProduct, deleteProduct, seedProducts };
};

// ── Reviews Hook (Supabase) ──
const useAdminReviews = () => {
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
    if (error) toast({ title: "Error loading reviews", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const addReview = async (review: Partial<DbReview>) => {
    const { error } = await supabase.from("reviews").insert({
      customer_name: review.customer_name || "",
      rating: review.rating || 5,
      comment: review.comment || "",
      status: "approved",
    });
    if (error) {
      toast({ title: "Error adding review", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Review Added", description: "New review has been added." });
    await refresh();
    return true;
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting review", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Review Deleted", description: "Review has been removed." });
    await refresh();
    return true;
  };

  const seedReviews = async () => {
    const dbReviews = initialTestimonials.map((t) => ({
      customer_name: t.name,
      rating: t.rating,
      comment: t.text,
      status: "approved",
    }));
    const { error } = await supabase.from("reviews").insert(dbReviews);
    if (error) {
      toast({ title: "Error seeding reviews", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Reviews Seeded", description: `${dbReviews.length} reviews added to database.` });
    await refresh();
  };

  return { reviews, loading, refresh, addReview, deleteReview, seedReviews };
};

// ── Settings Hook (Supabase) ──
const useAdminSettings = () => {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("store_settings").select("*");
    if (data && data.length > 0) {
      const map: Record<string, string> = {};
      data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });
      setSettings({
        storeName: map.storeName || defaultSettings.storeName,
        contactEmail: map.contactEmail || defaultSettings.contactEmail,
        currency: map.currency || defaultSettings.currency,
        phone: map.phone || defaultSettings.phone,
        address: map.address || defaultSettings.address,
      });
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const saveSettings = async (newSettings: SettingsData) => {
    const entries = Object.entries(newSettings);
    for (const [key, value] of entries) {
      await supabase.from("store_settings").upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    }
    setSettings(newSettings);
    toast({ title: "Settings Saved", description: "Your settings have been saved to database." });
  };

  const resetSettings = async () => {
    await supabase.from("store_settings").delete().neq("key", "");
    setSettings(defaultSettings);
    toast({ title: "Settings Reset", description: "Settings have been reset to defaults." });
  };

  return { settings, setSettings, loading, saveSettings, resetSettings };
};

// ── Main Component ──
const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [replyInput, setReplyInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: "", price: 0, brand: "", category: "mens", description: "",
    images: [] as string[], rating: 0, reviews_count: 0, in_stock: true, badge: "", stock_quantity: 50,
  });
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewForm, setReviewForm] = useState({ customer_name: "", comment: "", rating: 5 });
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const visitorStats = useVisitorStats();
  const chat = useAdminChat();
  const adminProducts = useAdminProducts();
  const adminReviews = useAdminReviews();
  const adminSettings = useAdminSettings();
  const { isAdmin, loading: roleLoading } = useAdminRole();

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
      if (!session?.user) {
        navigate("/admin/login", { replace: true });
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
      if (!session?.user) {
        navigate("/admin/login", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Redirect non-admin users
  useEffect(() => {
    if (!roleLoading && isAdmin === false && authChecked) {
      toast({ title: "Access Denied", description: "You don't have admin privileges.", variant: "destructive" });
      navigate("/", { replace: true });
    }
  }, [isAdmin, roleLoading, authChecked, navigate, toast]);

  // Chat auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "You have been signed out." });
    navigate("/admin/login");
  };

  if (!authChecked || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;


  const handleSendReply = async () => {
    await chat.sendReply(replyInput);
    setReplyInput("");
  };

  // ── Product CRUD ──
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", price: 0, brand: "", category: "mens", description: "", images: [], rating: 0, reviews_count: 0, in_stock: true, badge: "", stock_quantity: 50 });
    setProductDialog(true);
  };

  const openEditProduct = (p: DbProduct) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, price: p.price, brand: p.brand, category: p.category,
      description: p.description || "", images: p.images || [],
      rating: p.rating || 0, reviews_count: p.reviews_count || 0, in_stock: p.in_stock,
      badge: p.badge || "", stock_quantity: (p as any).stock_quantity ?? 50,
    });
    setProductDialog(true);
  };

  const saveProduct = async () => {
    if (!productForm.name.trim() || !productForm.brand.trim() || productForm.price <= 0) {
      toast({ title: "Validation Error", description: "Name, brand and valid price are required.", variant: "destructive" });
      return;
    }
    let success: boolean;
    if (editingProduct) {
      success = await adminProducts.updateProduct(editingProduct.id, productForm);
    } else {
      success = await adminProducts.addProduct(productForm);
    }
    if (success) setProductDialog(false);
  };

  const deleteProduct = async () => {
    if (!deleteDialog) return;
    await adminProducts.deleteProduct(deleteDialog);
    setDeleteDialog(null);
  };

  const filteredProducts = adminProducts.products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const matchCategory = productFilter === "all" || p.category === productFilter;
    return matchSearch && matchCategory;
  });

  // ── Review CRUD ──
  const saveReview = async () => {
    if (!reviewForm.customer_name.trim() || !reviewForm.comment.trim()) {
      toast({ title: "Validation Error", description: "Name and review text are required.", variant: "destructive" });
      return;
    }
    const success = await adminReviews.addReview(reviewForm);
    if (success) {
      setReviewDialog(false);
      setReviewForm({ customer_name: "", comment: "", rating: 5 });
    }
  };

  const deleteReview = async () => {
    if (!deleteReviewId) return;
    await adminReviews.deleteReview(deleteReviewId);
    setDeleteReviewId(null);
  };

  // Dashboard stats
  const stats = [
    { label: "Total Products", value: adminProducts.products.length.toString(), icon: Package, change: `${CATEGORIES.length} categories` },
    { label: "Total Reviews", value: adminReviews.reviews.length.toString(), icon: Star, change: `Avg ${(adminReviews.reviews.reduce((a, r) => a + r.rating, 0) / (adminReviews.reviews.length || 1)).toFixed(1)}★` },
    { label: "Visitors Today", value: visitorStats.totalToday.toString(), icon: Users, change: `${visitorStats.totalMonth} this month` },
    { label: "Open Chats", value: chat.conversations.filter((c) => c.status === "open").length.toString(), icon: MessageSquare, change: `${chat.conversations.length} total` },
  ];

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
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === t.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-sidebar-accent/50"
                }`}
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
          <Link to="/" className="flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-primary-foreground mt-6">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-primary-foreground mt-2"
          >
            <ArrowLeft className="h-4 w-4" /> Sign Out
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-10">
          {/* Mobile tabs */}
          <div className="flex gap-2 mb-6 lg:hidden overflow-x-auto pb-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeTab === t.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                }`}
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
                <span className="ml-auto text-xs text-muted-foreground">Live from database</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {stats.map((s) => (
                  <div key={s.label} className="bg-card rounded-lg p-5 shadow-soft">
                    <div className="flex items-center justify-between mb-2">
                      <s.icon className="h-5 w-5 text-accent" />
                      <span className="text-xs font-medium text-muted-foreground">{s.change}</span>
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <h2 className="font-display text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <button onClick={() => { setActiveTab("products"); setTimeout(openAddProduct, 100); }} className="bg-card rounded-lg p-4 shadow-soft hover:shadow-elevated transition-shadow text-left">
                  <Plus className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-medium">Add Product</p>
                </button>
                <button onClick={() => setActiveTab("chat")} className="bg-card rounded-lg p-4 shadow-soft hover:shadow-elevated transition-shadow text-left">
                  <MessageSquare className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-medium">View Chats</p>
                </button>
                <button onClick={() => setActiveTab("visitors")} className="bg-card rounded-lg p-4 shadow-soft hover:shadow-elevated transition-shadow text-left">
                  <Eye className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-medium">Track Visitors</p>
                </button>
                <button onClick={() => setActiveTab("settings")} className="bg-card rounded-lg p-4 shadow-soft hover:shadow-elevated transition-shadow text-left">
                  <Settings className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-medium">Settings</p>
                </button>
              </div>

              {/* Seed Data */}
              {adminProducts.products.length === 0 && (
                <div className="bg-card rounded-lg p-6 shadow-soft mb-8">
                  <h3 className="font-display text-lg font-bold mb-2">No products in database</h3>
                  <p className="text-sm text-muted-foreground mb-4">Seed the database with initial product data to get started.</p>
                  <div className="flex gap-3">
                    <Button onClick={adminProducts.seedProducts} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      <Plus className="h-4 w-4 mr-1" /> Seed Products
                    </Button>
                    <Button onClick={adminReviews.seedReviews} variant="outline">
                      <Plus className="h-4 w-4 mr-1" /> Seed Reviews
                    </Button>
                  </div>
                </div>
              )}

              {/* Recent Visitors */}
              <h2 className="font-display text-xl font-bold mb-4">Recent Visitors</h2>
              <div className="bg-card rounded-lg shadow-soft overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {["Time", "Page", "Device", "Browser"].map((h) => (
                        <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visitorStats.visitors.slice(0, 5).map((v) => (
                      <tr key={v.id} className="border-t border-border">
                        <td className="p-3 text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</td>
                        <td className="p-3 font-mono text-xs">{v.page?.split("?")[0]}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground">{v.device}</span></td>
                        <td className="p-3 text-xs">{v.browser}</td>
                      </tr>
                    ))}
                    {visitorStats.visitors.length === 0 && (
                      <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-sm">No visitors yet</td></tr>
                    )}
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
                {[
                  { icon: Clock, val: visitorStats.totalToday, label: "Today" },
                  { icon: Eye, val: visitorStats.totalWeek, label: "This Week" },
                  { icon: Globe, val: visitorStats.totalMonth, label: "This Month" },
                ].map((s) => (
                  <div key={s.label} className="bg-card rounded-lg p-5 shadow-soft">
                    <s.icon className="h-5 w-5 text-accent mb-2" />
                    <p className="text-3xl font-bold">{s.val}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
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
                          <td className="p-3 font-mono text-xs">{v.page?.split("?")[0]}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              v.device === "Mobile" ? "bg-blue-100 text-blue-700" :
                              v.device === "Desktop" ? "bg-purple-100 text-purple-700" :
                              "bg-orange-100 text-orange-700"
                            }`}>{v.device}</span>
                          </td>
                          <td className="p-3 text-xs">{v.browser}</td>
                        </tr>
                      ))}
                      {visitorStats.visitors.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No visitors tracked yet.</td></tr>
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
                    <p className="text-sm font-semibold">Conversations ({chat.conversations.length})</p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {chat.conversations.length === 0 && (
                      <p className="p-4 text-sm text-muted-foreground text-center">No conversations yet</p>
                    )}
                    {chat.conversations.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => chat.setActiveConv(c.id)}
                        className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                          chat.activeConv === c.id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{c.visitor_name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            c.status === "open" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                          }`}>{c.status}</span>
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
                      <div className="text-center">
                        <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Select a conversation to start replying</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          {chat.conversations.find((c) => c.id === chat.activeConv)?.visitor_name || "Visitor"}
                        </p>
                        {chat.conversations.find((c) => c.id === chat.activeConv)?.status === "open" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              chat.closeConversation(chat.activeConv!);
                              toast({ title: "Chat Closed", description: "Conversation has been closed." });
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" /> Close Chat
                          </Button>
                        )}
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
                        <div ref={chatEndRef} />
                      </div>
                      <div className="p-3 border-t border-border flex gap-2">
                        <Input
                          placeholder="Type a reply..."
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                          className="text-sm"
                        />
                        <Button size="icon" onClick={handleSendReply} disabled={!replyInput.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
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
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-3xl font-bold">Products ({filteredProducts.length})</h1>
                <div className="flex gap-2">
                  {adminProducts.products.length === 0 && (
                    <Button variant="outline" onClick={adminProducts.seedProducts}>
                      <RefreshCw className="h-4 w-4 mr-1" /> Seed Data
                    </Button>
                  )}
                  <Button onClick={openAddProduct} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="h-4 w-4 mr-1" /> Add Product
                  </Button>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                {filteredProducts.map((p) => {
                  const imgSrc = p.images?.[0]?.startsWith("http") ? p.images[0] : getImage(p.images?.[0] || "shoe-mens");
                  return (
                    <div key={p.id} className="flex items-center gap-4 bg-card rounded-lg p-4 shadow-soft">
                      <img src={imgSrc} alt={p.name} className="w-14 h-14 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{p.brand} · {p.category} · {formatPrice(p.price)}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.in_stock ? "In Stock" : "Out of Stock"}
                      </span>
                      <div className="flex gap-1.5">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEditProduct(p)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setDeleteDialog(p.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <div className="bg-card rounded-lg p-8 text-center text-muted-foreground shadow-soft">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No products found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── REVIEWS (with moderation) ── */}
          {activeTab === "reviews" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl font-bold">Customer Reviews ({adminReviews.reviews.length})</h1>
                <div className="flex gap-2">
                  {adminReviews.reviews.length === 0 && (
                    <Button variant="outline" onClick={adminReviews.seedReviews}>
                      <RefreshCw className="h-4 w-4 mr-1" /> Seed Reviews
                    </Button>
                  )}
                  <Button onClick={() => setReviewDialog(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="h-4 w-4 mr-1" /> Add Review
                  </Button>
                </div>
              </div>
              {/* Moderation stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-card rounded-lg p-4 shadow-soft text-center">
                  <p className="text-2xl font-bold">{adminReviews.reviews.filter((r) => r.status === "approved").length}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
                <div className="bg-card rounded-lg p-4 shadow-soft text-center">
                  <p className="text-2xl font-bold">{adminReviews.reviews.filter((r) => r.status === "pending").length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="bg-card rounded-lg p-4 shadow-soft text-center">
                  <p className="text-2xl font-bold">{adminReviews.reviews.filter((r) => r.status === "rejected").length}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </div>
              <div className="grid gap-4">
                {adminReviews.reviews.map((r) => (
                  <div key={r.id} className="bg-card rounded-lg p-5 shadow-soft">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                        ))}
                        {Array.from({ length: 5 - r.rating }).map((_, j) => (
                          <Star key={`e-${j}`} className="h-4 w-4 text-muted" />
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {r.status !== "approved" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={async () => {
                            await supabase.from("reviews").update({ status: "approved" }).eq("id", r.id);
                            adminReviews.refresh();
                            toast({ title: "Review Approved" });
                          }}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                          </Button>
                        )}
                        {r.status !== "rejected" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={async () => {
                            await supabase.from("reviews").update({ status: "rejected" }).eq("id", r.id);
                            adminReviews.refresh();
                            toast({ title: "Review Rejected" });
                          }}>
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteReviewId(r.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mb-3">"{r.comment}"</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{r.customer_name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }`}>{r.status}</span>
                    </div>
                  </div>
                ))}
                {adminReviews.reviews.length === 0 && (
                  <div className="bg-card rounded-lg p-8 text-center text-muted-foreground shadow-soft">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No reviews yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === "orders" && <OrdersManager />}

          {/* ── COUPONS ── */}
          {activeTab === "coupons" && <CouponsManager />}

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && <AnalyticsDashboard />}

          {/* ── CUSTOMERS ── */}
          {activeTab === "customers" && <CustomersManager />}

          {/* ── HERO BANNER ── */}
          {activeTab === "hero" && <HeroBannerEditor />}

          {/* ── THEME ── */}
          {activeTab === "theme" && <ThemeCustomizer />}

          {/* ── FOOTER ── */}
          {activeTab === "footer" && <FooterEditor />}

          {/* ── MENU ── */}
          {activeTab === "menu" && <MenuEditor />}

          {/* ── HOMEPAGE ── */}
          {activeTab === "homepage" && <HomepageEditor />}

          {/* ── ROLES ── */}
          {activeTab === "roles" && <RolesManager />}

          {activeTab === "settings" && (
            <div>
              <h1 className="font-display text-3xl font-bold mb-8">Settings</h1>
              <div className="bg-card rounded-lg p-6 shadow-soft max-w-lg space-y-5">
                <div>
                  <Label className="mb-1.5 block">Store Name</Label>
                  <Input value={adminSettings.settings.storeName} onChange={(e) => adminSettings.setSettings({ ...adminSettings.settings, storeName: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Contact Email</Label>
                  <Input type="email" value={adminSettings.settings.contactEmail} onChange={(e) => adminSettings.setSettings({ ...adminSettings.settings, contactEmail: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Phone Number</Label>
                  <Input value={adminSettings.settings.phone} onChange={(e) => adminSettings.setSettings({ ...adminSettings.settings, phone: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Address</Label>
                  <Input value={adminSettings.settings.address} onChange={(e) => adminSettings.setSettings({ ...adminSettings.settings, address: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Currency</Label>
                  <Input value={adminSettings.settings.currency} onChange={(e) => adminSettings.setSettings({ ...adminSettings.settings, currency: e.target.value })} />
                </div>
                <Button onClick={() => adminSettings.saveSettings(adminSettings.settings)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Save className="h-4 w-4 mr-1" /> Save Changes
                </Button>
              </div>

              {/* Danger Zone */}
              <div className="bg-card rounded-lg p-6 shadow-soft max-w-lg mt-8 border border-destructive/20">
                <h3 className="font-display text-lg font-bold text-destructive mb-3">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">Reset settings to their default values.</p>
                <Button variant="destructive" onClick={adminSettings.resetSettings}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Reset to Defaults
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Product Add/Edit Dialog ── */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Product Name *</Label>
              <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g. Nike Air Max 90" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Price (€) *</Label>
                <Input type="number" min="0" step="0.01" value={productForm.price || ""} onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="mb-1.5 block">Rating</Label>
                <Input type="number" min="0" max="5" step="0.1" value={productForm.rating || ""} onChange={(e) => setProductForm({ ...productForm, rating: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Brand *</Label>
              <Input value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} placeholder="e.g. Nike" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Category</Label>
                <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">In Stock</Label>
                <Select value={productForm.in_stock ? "yes" : "no"} onValueChange={(v) => setProductForm({ ...productForm, in_stock: v === "yes" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Stock Quantity</Label>
                <Input type="number" min="0" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: parseInt(e.target.value) || 0 })} placeholder="e.g. 50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Badge</Label>
                <Select value={productForm.badge || "none"} onValueChange={(v) => setProductForm({ ...productForm, badge: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Bestseller">Bestseller</SelectItem>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Limited">Limited</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Input value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Product description..." />
            </div>
            <ImageUploader
              images={productForm.images.filter((img) => img.startsWith("http"))}
              onImagesChange={(imgs) => setProductForm({ ...productForm, images: imgs })}
              maxImages={10}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveProduct} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {editingProduct ? "Update" : "Add"} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Product Confirm ── */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete "{adminProducts.products.find((p) => p.id === deleteDialog)?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={deleteProduct}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Review Dialog ── */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Customer Name *</Label>
              <Input value={reviewForm.customer_name} onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })} placeholder="e.g. John Doe" />
            </div>
            <div>
              <Label className="mb-1.5 block">Review Text *</Label>
              <Input value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Write the review..." />
            </div>
            <div>
              <Label className="mb-1.5 block">Rating</Label>
              <Select value={reviewForm.rating.toString()} onValueChange={(v) => setReviewForm({ ...reviewForm, rating: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((r) => <SelectItem key={r} value={r.toString()}>{r} Star{r > 1 ? "s" : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveReview} className="bg-accent text-accent-foreground hover:bg-accent/90">Add Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Review Confirm ── */}
      <Dialog open={deleteReviewId !== null} onOpenChange={() => setDeleteReviewId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this review? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={deleteReview}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
