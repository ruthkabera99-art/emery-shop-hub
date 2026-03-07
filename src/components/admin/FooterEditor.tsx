import { useAdminFooter, defaultFooterConfig } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, Plus, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FooterEditor = () => {
  const { config, setConfig, save } = useAdminFooter();
  const { toast } = useToast();

  const handleSave = async () => {
    await save(config);
    toast({ title: "Footer Saved", description: "Footer settings saved. Refresh the store to see changes." });
  };

  const handleReset = () => {
    setConfig(defaultFooterConfig);
    toast({ title: "Footer Reset", description: "Footer reset to defaults. Click Save to apply." });
  };

  const updateQuickLink = (index: number, field: "label" | "url", value: string) => {
    const links = [...config.quickLinks];
    links[index] = { ...links[index], [field]: value };
    setConfig({ ...config, quickLinks: links });
  };

  const addQuickLink = () => {
    setConfig({ ...config, quickLinks: [...config.quickLinks, { label: "New Link", url: "/" }] });
  };

  const removeQuickLink = (index: number) => {
    setConfig({ ...config, quickLinks: config.quickLinks.filter((_, i) => i !== index) });
  };

  const updateCategory = (index: number, field: "label" | "url", value: string) => {
    const cats = [...config.categories];
    cats[index] = { ...cats[index], [field]: value };
    setConfig({ ...config, categories: cats });
  };

  const addCategory = () => {
    setConfig({ ...config, categories: [...config.categories, { label: "New Category", url: "/shop" }] });
  };

  const removeCategory = (index: number) => {
    setConfig({ ...config, categories: config.categories.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Footer Editor</h1>
      <p className="text-sm text-muted-foreground mb-8">Edit your store's footer content, links, and contact information.</p>

      {/* Brand Section */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-2xl">
        <h3 className="font-display text-lg font-bold mb-4">Brand</h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Brand Name</Label>
            <Input value={config.brandName} onChange={(e) => setConfig({ ...config, brandName: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5 block">Brand Tagline</Label>
            <Input value={config.brandTagline} onChange={(e) => setConfig({ ...config, brandTagline: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5 block">Copyright Text</Label>
            <Input value={config.copyrightText} onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold">Quick Links</h3>
          <Button size="sm" variant="outline" onClick={addQuickLink}>
            <Plus className="h-3 w-3 mr-1" /> Add Link
          </Button>
        </div>
        <div className="space-y-3">
          {config.quickLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input value={link.label} onChange={(e) => updateQuickLink(i, "label", e.target.value)} placeholder="Label" className="flex-1" />
              <Input value={link.url} onChange={(e) => updateQuickLink(i, "url", e.target.value)} placeholder="/path" className="flex-1" />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeQuickLink(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold">Categories</h3>
          <Button size="sm" variant="outline" onClick={addCategory}>
            <Plus className="h-3 w-3 mr-1" /> Add Category
          </Button>
        </div>
        <div className="space-y-3">
          {config.categories.map((cat, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input value={cat.label} onChange={(e) => updateCategory(i, "label", e.target.value)} placeholder="Label" className="flex-1" />
              <Input value={cat.url} onChange={(e) => updateCategory(i, "url", e.target.value)} placeholder="/path" className="flex-1" />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeCategory(i)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-2xl">
        <h3 className="font-display text-lg font-bold mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Address</Label>
            <Input value={config.contactAddress} onChange={(e) => setConfig({ ...config, contactAddress: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5 block">Phone</Label>
            <Input value={config.contactPhone} onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5 block">Email</Label>
            <Input value={config.contactEmail} onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="h-4 w-4 mr-1" /> Save Footer
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-1" /> Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default FooterEditor;
