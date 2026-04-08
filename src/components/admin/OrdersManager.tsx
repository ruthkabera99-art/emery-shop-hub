
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag, Search, RefreshCw, Clock, CheckCircle, Truck, XCircle, Eye, Download,
} from "lucide-react";

interface Order {
  id: string;
  user_id: string;
  items: any[];
  total: number;
  status: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};
const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: RefreshCw,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
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
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading orders", description: error.message, variant: "destructive" });
    }
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Error updating order", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Order Updated", description: `Status changed to ${newStatus}.` });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (detailOrder?.id === orderId) {
      setDetailOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const exportCSV = () => {
    const headers = ["Order ID", "Status", "Total", "Date", "Items Count"];
    const rows = filtered.map((o) => [
      o.id.slice(0, 8),
      o.status,
      o.total.toFixed(2),
      new Date(o.created_at).toLocaleDateString(),
      Array.isArray(o.items) ? o.items.length : 0,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Orders exported as CSV." });
  };

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((a, o) => a + o.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders", value: orders.length, icon: ShoppingBag },
          { label: "Revenue", value: formatPrice(totalRevenue), icon: CheckCircle },
          { label: "Pending", value: orders.filter((o) => o.status === "pending").length, icon: Clock },
          { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length, icon: Truck },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-lg p-5 shadow-soft">
            <s.icon className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="bg-card rounded-lg shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {["Order ID", "Date", "Items", "Total", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const Icon = STATUS_ICONS[o.status] || Clock;
              return (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-xs">{Array.isArray(o.items) ? o.items.length : 0} items</td>
                  <td className="p-3 font-medium">{formatPrice(o.total)}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[o.status] || "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-3 w-3" /> {o.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1.5">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setDetailOrder(o)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No orders found</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{detailOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Status:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[detailOrder.status]}`}>{detailOrder.status}</span>
                </div>
                <div><span className="text-muted-foreground">Total:</span> <span className="font-bold ml-1">{formatPrice(detailOrder.total)}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="ml-1">{new Date(detailOrder.created_at).toLocaleString()}</span></div>
                <div><span className="text-muted-foreground">User:</span> <span className="ml-1 font-mono text-xs">{detailOrder.user_id.slice(0, 8)}...</span></div>
              </div>

              {detailOrder.shipping_address && (
                <div>
                  <p className="text-sm font-medium mb-1">Shipping Address</p>
                  <div className="bg-muted rounded-lg p-3 text-xs">
                    {typeof detailOrder.shipping_address === "object"
                      ? Object.entries(detailOrder.shipping_address as Record<string, any>).map(([k, v]) => (
                          <p key={k}><span className="text-muted-foreground">{k}:</span> {String(v)}</p>
                        ))
                      : <p>{String(detailOrder.shipping_address)}</p>}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Items ({Array.isArray(detailOrder.items) ? detailOrder.items.length : 0})</p>
                <div className="space-y-2">
                  {Array.isArray(detailOrder.items) && detailOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-muted rounded-lg p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name || "Item"}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity || 1} × {formatPrice(item.price || 0)}</p>
                      </div>
                      <p className="text-sm font-bold">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Update Status</p>
                <Select value={detailOrder.status} onValueChange={(v) => updateStatus(detailOrder.id, v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManager;
