import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import { AboutConfig, ABOUT_KEY, defaultAboutConfig, TeamMember } from "@/lib/aboutConfig";
import { Plus, Trash2 } from "lucide-react";

const AboutEditor = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AboutConfig>(defaultAboutConfig);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("store_settings").select("value").eq("key", ABOUT_KEY).maybeSingle().then(({ data }) => {
      if (data?.value) {
        try { setConfig({ ...defaultAboutConfig, ...JSON.parse(data.value) }); } catch { /* keep defaults */ }
      }
    });
  }, []);

  const updateMember = (i: number, patch: Partial<TeamMember>) =>
    setConfig((c) => ({ ...c, team: c.team.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) }));

  const save = async () => {
    setSaving(true);
    const clean = { ...config, team: config.team.filter((m) => m.name.trim()) };
    const { error } = await supabase.from("store_settings").upsert(
      { key: ABOUT_KEY, value: JSON.stringify(clean), updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    setSaving(false);
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
    else { setConfig(clean); toast({ title: "About Us page saved" }); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-bold">About Us page</h2>
        <p className="text-sm text-muted-foreground">Contact details come from Shop details on the dashboard.</p>
      </div>
      <div className="space-y-2">
        <Label>Page title</Label>
        <Input value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Our story</Label>
        <Textarea rows={8} value={config.story} placeholder="Tell shoppers how Emery Collection started…" onChange={(e) => setConfig({ ...config, story: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Story photo</Label>
        <ImageUploader images={config.imageUrl ? [config.imageUrl] : []} maxImages={1} onImagesChange={(imgs: string[]) => setConfig({ ...config, imageUrl: imgs[0] || "" })} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Team</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => setConfig({ ...config, team: [...config.team, { name: "", role: "" }] })}>
            <Plus className="w-4 h-4 mr-1" /> Add person
          </Button>
        </div>
        {config.team.map((m, i) => (
          <div key={i} className="bg-card rounded-lg p-4 space-y-3 border border-border">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Name" value={m.name} onChange={(e) => updateMember(i, { name: e.target.value })} />
              <Input placeholder="Role (e.g. Founder)" value={m.role} onChange={(e) => updateMember(i, { role: e.target.value })} />
            </div>
            <Textarea rows={2} placeholder="Short bio (optional)" value={m.bio || ""} onChange={(e) => updateMember(i, { bio: e.target.value })} />
            <ImageUploader images={m.photoUrl ? [m.photoUrl] : []} maxImages={1} onImagesChange={(imgs: string[]) => updateMember(i, { photoUrl: imgs[0] || "" })} />
            <Button type="button" variant="destructive" size="sm" onClick={() => setConfig({ ...config, team: config.team.filter((_, idx) => idx !== i) })}>
              <Trash2 className="w-4 h-4 mr-1" /> Remove
            </Button>
          </div>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={config.showContact} onChange={(e) => setConfig({ ...config, showContact: e.target.checked })} />
        Show contact details on the page
      </label>
      <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save About Us page"}</Button>
    </div>
  );
};

export default AboutEditor;
