import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag, Search, RefreshCw, Clock, CheckCircle, Truck, XCircle, Eye, Download, Printer, CreditCard,
} from "lucide-react";

interface Address {
  name?: string; email?: string; phone?: string; street?: string; city?: string; postal?: string; country?: string;
  [k: string]: any;
}
interface Order {
  id: string;
  user_id: string;
  items: any[];
  total: number;
  status: string;
  shipping_address: Address | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const STATUS_ICONS: Record<string, any> = {
  pending: Clock, confirmed: CheckCircle, processing: RefreshCw, shipped: Truck, delivered: CheckCircle, cancelled: XCircle,
};

/** Payment state derived from order status (pending = awaiting payment). */
const paymentStatus = (status: string): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
  if (status === "pending") return { label: "Awaiting payment", variant: "outline" };
  if (status === "cancelled") return { label: "Cancelled / refunded", variant: "destructive" };
  return { label: "Paid", variant: "default" };
};

const addr = (o: Order): Address => (o.shipping_address && typeof o.shipping_address === "object" ? o.shipping_address : {});
const escapeHtml = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const printReceipt = (o: Order) => {
  const a = addr(o);
  const items = Array.isArray(o.items) ? o.items : [];
  const rows = items.map((i: any) => `<tr><td>${escapeHtml(i.name || "Item")}${i.size ? ` (Size ${escapeHtml(i.size)})` : ""}</td><td>${Number(i.quantity || 1)}</td><td>${formatPrice(i.price || 0)}</td><td>${formatPrice((i.price || 0) * (i.quantity || 1))}</td></tr>`).join("");
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>Receipt #${o.id.slice(0, 8).toUpperCase()}</title>
<style>body{font-family:Georgia,serif;padding:32px;color:#222}h1{margin:0}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left;font-size:14px}.r{text-align:right}.muted{color:#666;font-size:13px}</style></head><body>
<h1>Emery Collection Shop</h1><p class="muted">Order receipt</p>
<p><b>Order:</b> #${o.id.slice(0, 8).toUpperCase()}<br><b>Date:</b> ${new Date(o.created_at).toLocaleString()}<br><b>Status:</b> ${escapeHtml(o.status)} — ${paymentStatus(o.status).label}</p>
<p><b>Customer:</b><br>${escapeHtml(a.name)}<br>${escapeHtml(a.email)}<br>${escapeHtml(a.phone)}<br>${escapeHtml(a.street)}<br>${escapeHtml(a.postal)} ${escapeHtml(a.city)}<br>${escapeHtml(a.country)}</p>
<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody>
<tfoot><tr><th colspan="3" class="r">Total</th><th>${formatPrice(o.total)}</th></tr></tfoot></table>
<p class="muted">Thank you for shopping with us.</p><script>window.onload=()=>{window.print()}</script></body></html>`);
  w.document.close();
};

const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error loading orders", description: error.message, variant: "destructive" });
    const list = (data as unknown as Order[]) || [];
    setOrders(list);
    setLoading(false);
    const deepLink = new URLSearchParams(window.location.search).get("order");
    if (deepLink) {
      const match = list.find((o) => o.id === deepLink);
      if (match) setDetailOrder(match);
    }
  };

  useEffect(() => { refresh(); }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", orderId);
    if (error) {
      toast({ title: "Error updating order", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Order updated", description: `Status changed to ${newStatus}.` });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setDetailOrder((prev) => (prev?.id === orderId ? { ...prev, status: newStatus } : prev));
  };

  const filtered = orders.filter((o) => {
    const a = addr(o);
    const q = search.toLowerCase();
    const matchSearch = !q || [o.id, a.name, a.email, a.phone].some((v) => String(v || "").toLowerCase().includes(q));
    return matchSearch && (statusFilter === "all" || o.status === statusFilter);
  });

  const exportCSV = () => {
    const headers = ["Order ID", "Customer", "Email", "Phone", "Status", "Payment", "Total", "Date", "Items"];
    const rows = filtered.map((o) => {
      const a = addr(o);
      return [o.id.slice(0, 8), a.name || "", a.email || "", a.phone || "", o.status, paymentStatus(o.status).label, Number(o.total).toFixed(2), new Date(o.created_at).toLocaleDateString(), Array.isArray(o.items) ? o.items.length : 0]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`);
    });
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const el = document.createElement("a");
    el.href = url;
    el.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    el.click();
    URL.revokeObjectURL(url);
  };

  const paidOrders = orders.filter((o) => paymentStatus(o.status).label === "Paid");
  const revenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-3xl font-bold">Orders ({filtered.length})</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total orders", value: orders.length, icon: ShoppingBag },
          { label: "Paid revenue", value: formatPrice(revenue), icon: CreditCard },
          { label: "Awaiting payment", value: orders.filter((o) => o.status === "pending").length, icon: Clock },
          { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length, icon: Truck },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-lg p-5 shadow-soft">
            <s.icon className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search order, name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg shadow-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead className="bg-muted">
            <tr>
              {["Order", "Customer", "Date", "Items", "Total", "Payment", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const a = addr(o);
              const pay = paymentStatus(o.status);
              return (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-3">
                    <p className="font-medium text-xs">{a.name || "—"}</p>
                    <p className="text-[11px] text-muted-foreground">{a.email || ""}</p>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-xs">{Array.isArray(o.items) ? o.items.length : 0}</td>
                  <td className="p-3 font-medium">{formatPrice(o.total)}</td>
                  <td className="p-3"><Badge variant={pay.variant} className="text-[10px]">{pay.label}</Badge></td>
                  <td className="p-3">
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="h-7 w-28 text-xs capitalize"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1.5">
                      <Button size="icon" variant="outline" className="h-7 w-7" aria-label="View order" onClick={() => setDetailOrder(o)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-7 w-7" aria-label="Print receipt" onClick={() => printReceipt(o)}>
                        <Printer className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{loading ? "Loading orders..." : "No orders found"}</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{detailOrder?.id.slice(0, 8).toUpperCase()}</DialogTitle>
          </DialogHeader>
          {detailOrder && (() => {
            const a = addr(detailOrder);
            const pay = paymentStatus(detailOrder.status);
            const Icon = STATUS_ICONS[detailOrder.status] || Clock;
            return (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 capitalize"><Icon className="h-4 w-4 text-accent" />{detailOrder.status}</div>
                  <div><Badge variant={pay.variant}>{pay.label}</Badge></div>
                  <div><span className="text-muted-foreground">Total:</span> <b>{formatPrice(detailOrder.total)}</b></div>
                  <div className="text-xs text-muted-foreground">{new Date(detailOrder.created_at).toLocaleString()}</div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Customer</p>
                  <div className="bg-muted rounded-lg p-3 text-xs space-y-0.5">
                    <p className="font-medium">{a.name || "Unknown"}</p>
                    {a.email && <p><a className="underline" href={`mailto:${a.email}`}>{a.email}</a></p>}
                    {a.phone && <p><a className="underline" href={`tel:${a.phone}`}>{a.phone}</a></p>}
                    {(a.street || a.city) && <p>{a.street}, {a.postal} {a.city}, {a.country}</p>}
                    <p className="text-muted-foreground font-mono pt-1">Account: {detailOrder.user_id.slice(0, 8)}…</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Items ({Array.isArray(detailOrder.items) ? detailOrder.items.length : 0})</p>
                  <div className="space-y-2">
                    {Array.isArray(detailOrder.items) && detailOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-muted rounded-lg p-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name || "Item"}{item.size ? ` · Size ${item.size}` : ""}</p>
                          <p className="text-xs text-muted-foreground">Qty {item.quantity || 1} × {formatPrice(item.price || 0)}</p>
                        </div>
                        <p className="text-sm font-bold">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Update status</p>
                  <Select value={detailOrder.status} onValueChange={(v) => updateStatus(detailOrder.id, v)}>
                    <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })()}
          <DialogFooter className="gap-2">
            {detailOrder && (
              <Button variant="secondary" onClick={() => printReceipt(detailOrder)}>
                <Printer className="h-4 w-4 mr-1" /> Print receipt
              </Button>
            )}
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManager;
