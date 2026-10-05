import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Package, Tag, Settings, Save, ArrowRight, Loader2, Search } from "lucide-react";

type Order = { id: string; total: number; status: string; created_at: string; shipping_address: any };
type Product = { id: string; name: string; price: number; category: string; stock_quantity: number | null; in_stock: boolean | null };

const SETTING_KEYS = [
  { key: "storeName", label: "Shop name" },
  { key: "address", label: "Address" },
  { key: "phone", label: "Phone" },
  { key: "contactEmail", label: "Email" },
];

interface Props { onOpenTab: (tab: string) => void }

const ShopOverview = ({ onOpenTab }: Props) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    (async () => {
      const [o, p, s] = await Promise.all([
        supabase.from("orders").select("id,total,status,created_at,shipping_address").order("created_at", { ascending: false }).limit(8),
        supabase.from("products").select("id,name,price,category,stock_quantity,in_stock").order("name"),
        supabase.from("store_settings").select("key,value").in("key", SETTING_KEYS.map((k) => k.key)),
      ]);
      setOrders((o.data as Order[]) || []);
      setProducts((p.data as Product[]) || []);
      setSettings(Object.fromEntries((s.data || []).map((r) => [r.key, r.value])));
    })();
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, { count: number; low: number }>();
    products.forEach((p) => {
      const c = p.category || "Uncategorized";
      const e = map.get(c) || { count: 0, low: 0 };
      e.count++;
      if ((p.stock_quantity ?? 0) <= 5) e.low++;
      map.set(c, e);
    });
    return [...map.entries()].sort((a, b) => b[1].count - a[1].count);
  }, [products]);

  const filtered = products.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10);

  const updateProduct = async (p: Product, patch: Partial<Product>) => {
    setSavingId(p.id);
    const next = { ...patch };
    if (patch.stock_quantity !== undefined) next.in_stock = (patch.stock_quantity ?? 0) > 0;
    const { error } = await supabase.from("products").update({ ...next, updated_at: new Date().toISOString() }).eq("id", p.id);
    setSavingId(null);
    if (error) return toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, ...next } : x)));
    toast({ title: "Saved", description: p.name });
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    const rows = SETTING_KEYS.map(({ key }) => ({ key, value: settings[key] || "", updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("store_settings").upsert(rows, { onConflict: "key" });
    setSavingSettings(false);
    if (error) return toast({ title: "Couldn't save settings", description: error.message, variant: "destructive" });
    toast({ title: "Shop details saved" });
  };

  const Section = ({ icon: Icon, title, tab, children }: any) => (
    <section className="bg-card rounded-lg shadow-soft p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold flex items-center gap-2"><Icon className="h-5 w-5 text-accent" />{title}</h2>
        <Button variant="ghost" size="sm" onClick={() => onOpenTab(tab)}>Open all <ArrowRight className="h-4 w-4 ml-1" /></Button>
      </div>
      {children}
    </section>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-10">
      <Section icon={ShoppingBag} title="Recent orders" tab="orders">
        <div className="space-y-2">
          {orders.map((o) => (
            <button key={o.id} onClick={() => { window.history.replaceState(null, "", `/admin?tab=orders&order=${o.id}`); onOpenTab("orders"); }}
              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-left">
              <span className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</span>
              <span className="text-sm flex-1 truncate">{o.shipping_address?.name || "—"}</span>
              <Badge variant={o.status === "pending" ? "outline" : "secondary"} className="capitalize text-[10px]">{o.status}</Badge>
              <span className="text-sm font-medium w-20 text-right">{formatPrice(o.total)}</span>
            </button>
          ))}
          {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
        </div>
      </Section>

      <Section icon={Tag} title={`Categories (${categories.length})`} tab="products">
        <div className="grid grid-cols-2 gap-2">
          {categories.map(([name, c]) => (
            <div key={name} className="bg-muted rounded-md p-3">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-xs text-muted-foreground">{c.count} products{c.low ? ` · ${c.low} low stock` : ""}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Package} title={`Products (${products.length})`} tab="products">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Find a product..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="text-sm flex-1 truncate" title={p.name}>{p.name}</span>
              <Input type="number" aria-label={`Price for ${p.name}`} defaultValue={p.price} className="h-8 w-20 text-xs"
                onBlur={(e) => Number(e.target.value) !== Number(p.price) && updateProduct(p, { price: Number(e.target.value) })} />
              <Input type="number" aria-label={`Stock for ${p.name}`} defaultValue={p.stock_quantity ?? 0} className="h-8 w-16 text-xs"
                onBlur={(e) => Number(e.target.value) !== (p.stock_quantity ?? 0) && updateProduct(p, { stock_quantity: Number(e.target.value) })} />
              {savingId === p.id && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">Edit price (€) and stock, then click away to save.</p>
        </div>
      </Section>

      <Section icon={Settings} title="Shop details" tab="settings">
        <div className="space-y-3">
          {SETTING_KEYS.map(({ key, label }) => (
            <div key={key}>
              <Label htmlFor={`ov-${key}`} className="text-xs">{label}</Label>
              <Input id={`ov-${key}`} value={settings[key] || ""} onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))} />
            </div>
          ))}
          <Button onClick={saveSettings} disabled={savingSettings} className="w-full">
            {savingSettings ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save shop details
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default ShopOverview;
