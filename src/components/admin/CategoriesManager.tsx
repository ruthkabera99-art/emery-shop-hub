import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Package } from "lucide-react";

interface Props {
  products: { category: string }[];
  onRefresh: () => Promise<void>;
  onFilter: (category: string) => void;
}

const CategoriesManager = ({ products, onRefresh, onFilter }: Props) => {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => counts.set(product.category, (counts.get(product.category) || 0) + 1));
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [products]);

  const rename = async (category: string) => {
    const next = drafts[category]?.trim();
    if (!next || next === category) return;
    if (categories.some(([name]) => name.toLowerCase() === next.toLowerCase())) {
      toast({ title: "Category already exists", description: "Choose a different name.", variant: "destructive" });
      return;
    }
    setSaving(category);
    try {
      const { error } = await supabase.from("products").update({ category: next, updated_at: new Date().toISOString() }).eq("category", category);
      if (error) throw error;
      await onRefresh();
      toast({ title: "Category renamed" });
    } catch (error) {
      toast({ title: "Couldn't rename category", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally { setSaving(null); }
  };

  return <section id="dashboard-categories" className="border-t border-border py-8 scroll-mt-20">
    <h2 className="font-display text-2xl font-bold mb-5">Categories ({categories.length})</h2>
    <div className="grid md:grid-cols-2 gap-4">
      {categories.map(([name, count]) => <div key={name} className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Input aria-label={`Category name ${name || "Uncategorized"}`} className="flex-1 min-w-32" value={drafts[name] ?? name} onChange={(event) => setDrafts({ ...drafts, [name]: event.target.value })} />
        <span className="text-xs text-muted-foreground">{count} products</span>
        <Button size="icon" variant="outline" title="Save category name" aria-label={`Save category ${name}`} disabled={saving !== null || !drafts[name]?.trim() || drafts[name] === name} onClick={() => rename(name)}><Save className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" title="View category products" aria-label={`View products in ${name}`} onClick={() => onFilter(name)}><Package className="h-4 w-4" /></Button>
      </div>)}
    </div>
    {categories.length === 0 && <p className="text-muted-foreground">No categories yet.</p>}
  </section>;
};

export default CategoriesManager;