import { useAdminMenu, defaultMenuConfig } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, Plus, Trash2, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MenuEditor = () => {
  const { config, setConfig, save } = useAdminMenu();
  const { toast } = useToast();

  const handleSave = async () => {
    await save(config);
    toast({ title: "Menu Saved", description: "Navigation menu saved. Refresh the store to see changes." });
  };

  const handleReset = () => {
    setConfig(defaultMenuConfig);
    toast({ title: "Menu Reset", description: "Menu reset to defaults. Click Save to apply." });
  };

  const updateItem = (index: number, field: "label" | "url", value: string) => {
    const items = [...config.items];
    items[index] = { ...items[index], [field]: value };
    setConfig({ ...config, items });
  };

  const toggleVisibility = (index: number) => {
    const items = [...config.items];
    items[index] = { ...items[index], visible: !items[index].visible };
    setConfig({ ...config, items });
  };

  const addItem = () => {
    setConfig({ ...config, items: [...config.items, { label: "New Page", url: "/", visible: true }] });
  };

  const removeItem = (index: number) => {
    setConfig({ ...config, items: config.items.filter((_, i) => i !== index) });
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const items = [...config.items];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    setConfig({ ...config, items });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Menu Editor</h1>
      <p className="text-sm text-muted-foreground mb-8">Add, remove, reorder, and toggle navigation menu items.</p>

      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold">Navigation Items</h3>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </div>
        <div className="space-y-3">
          {config.items.map((item, i) => (
            <div key={i} className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${item.visible ? "border-border bg-background" : "border-border/50 bg-muted/50 opacity-60"}`}>
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input value={item.label} onChange={(e) => updateItem(i, "label", e.target.value)} placeholder="Label" />
                <Input value={item.url} onChange={(e) => updateItem(i, "url", e.target.value)} placeholder="/path" />
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveItem(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveItem(i, 1)} disabled={i === config.items.length - 1}>
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleVisibility(i)}>
                  {item.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeItem(i)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-2xl">
        <h3 className="font-display text-lg font-bold mb-4">Navigation Preview</h3>
        <div className="flex items-center gap-6 p-4 bg-background rounded-lg border">
          <span className="font-display text-sm font-bold">EMERY COLLECTION</span>
          <div className="flex gap-4">
            {config.items.filter((i) => i.visible).map((item, idx) => (
              <span key={idx} className="text-sm text-muted-foreground hover:text-foreground cursor-default">{item.label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="h-4 w-4 mr-1" /> Save Menu
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-1" /> Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default MenuEditor;
