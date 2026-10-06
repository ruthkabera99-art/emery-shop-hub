import { useState } from "react";
import { useAdminFooter } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, Loader2 } from "lucide-react";

const ShopBrandingEditor = () => {
  const { config, setConfig, loading } = useAdminFooter();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const links = config.socialLinks || [];

  const handleSave = async () => {
    if (!config.brandName.trim()) {
      toast({ title: "Enter your shop name", variant: "destructive" });
      return;
    }
    if (links.some((link) => !link.label.trim() || !/^https:\/\/.+/i.test(link.url))) {
      toast({ title: "Check social links", description: "Each social link needs a name and an https:// address.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const rows = Object.entries({
        storeName: config.brandName.trim(), address: config.contactAddress,
        phone: config.contactPhone, contactEmail: config.contactEmail,
        footer_config: JSON.stringify({ ...config, brandName: config.brandName.trim() }),
      }).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
      const { error } = await supabase.from("store_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      // Notify mounted public consumers even when Realtime is not enabled on this table.
      window.dispatchEvent(new Event("shop-branding-saved"));
      toast({ title: "Shop details saved", description: "Footer and website search information now use these details." });
    } catch (error) {
      toast({ title: "Couldn't save shop details", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (loading) return <p role="status" className="text-muted-foreground">Loading shop details…</p>;
  return (
    <section className="space-y-5 max-w-2xl">
      <h2 className="font-display text-xl font-bold">Shop details & logo</h2>
      <fieldset disabled={saving} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            ["brandName", "Shop name"], ["contactAddress", "Address"],
            ["contactPhone", "Phone"], ["contactEmail", "Email"],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={`branding-${key}`}>{label}</Label>
              <Input id={`branding-${key}`} type={key === "contactEmail" ? "email" : "text"} value={config[key]} onChange={(event) => setConfig({ ...config, [key]: event.target.value })} />
            </div>
          ))}
        </div>
        <div>
          <Label className="block mb-2">Shop logo</Label>
          <ImageUploader images={config.logoUrl ? [config.logoUrl] : []} maxImages={1} onImagesChange={(images) => setConfig({ ...config, logoUrl: images[0] || "" })} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label>Social links</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => setConfig({ ...config, socialLinks: [...links, { label: "", url: "" }] })}><Plus className="h-4 w-4 mr-1" />Add link</Button>
          </div>
          {links.map((link, index) => (
            <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2">
              <Input aria-label={`Social name ${index + 1}`} placeholder="Instagram" value={link.label} onChange={(event) => setConfig({ ...config, socialLinks: links.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} />
              <Input aria-label={`Social URL ${index + 1}`} type="url" placeholder="https://" value={link.url} onChange={(event) => setConfig({ ...config, socialLinks: links.map((item, i) => i === index ? { ...item, url: event.target.value } : item) })} />
              <Button type="button" size="icon" variant="ghost" aria-label={`Remove social link ${index + 1}`} onClick={() => setConfig({ ...config, socialLinks: links.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </fieldset>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save shop details
      </Button>
    </section>
  );
};

export default ShopBrandingEditor;