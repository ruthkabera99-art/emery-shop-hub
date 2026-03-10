import { useAdminHero, defaultHeroConfig } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, RefreshCw, Image, Type, MousePointerClick } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "./ImageUploader";

const HeroBannerEditor = () => {
  const { config, setConfig, save } = useAdminHero();
  const { toast } = useToast();

  const handleSave = async () => {
    await save(config);
    toast({ title: "Hero Banner Saved", description: "Hero banner updated. Changes are live on the storefront." });
  };

  const handleReset = () => {
    setConfig(defaultHeroConfig);
    toast({ title: "Hero Reset", description: "Hero banner reset to defaults. Click Save to apply." });
  };

  const handleImageUploaded = (url: string) => {
    setConfig({ ...config, imageUrl: url });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Hero Banner Editor</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Customize the hero banner text, image, and call-to-action buttons.
      </p>

      {/* Text Content */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6">
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Type className="h-5 w-5 text-accent" /> Text Content
        </h3>
        <div className="space-y-4 max-w-lg">
          <div>
            <Label className="mb-1.5 block">Subtitle</Label>
            <Input
              value={config.subtitle}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              placeholder="New Collection 2026"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Main Title</Label>
            <Input
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              placeholder="Step Into"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Accent Word (gradient highlight)</Label>
            <Input
              value={config.titleAccent}
              onChange={(e) => setConfig({ ...config, titleAccent: e.target.value })}
              placeholder="Elegance"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="Discover our curated collection..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6">
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Image className="h-5 w-5 text-accent" /> Hero Image
        </h3>
        <div className="max-w-lg space-y-4">
          {config.imageUrl && (
            <div className="rounded-lg overflow-hidden border border-border aspect-video">
              <img src={config.imageUrl} alt="Hero preview" className="w-full h-full object-cover" />
            </div>
          )}
          <ImageUploader onImageUploaded={handleImageUploaded} />
          <p className="text-xs text-muted-foreground">
            Leave empty to use the default hero image. Recommended size: 1920×1080px.
          </p>
          {config.imageUrl && (
            <Button variant="outline" size="sm" onClick={() => setConfig({ ...config, imageUrl: "" })}>
              Remove &amp; Use Default
            </Button>
          )}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6">
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <MousePointerClick className="h-5 w-5 text-accent" /> Call-to-Action Buttons
        </h3>
        <div className="space-y-6 max-w-lg">
          <div>
            <p className="text-sm font-semibold mb-2">Primary Button</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs">Label</Label>
                <Input
                  value={config.primaryCta.label}
                  onChange={(e) => setConfig({ ...config, primaryCta: { ...config.primaryCta, label: e.target.value } })}
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">URL</Label>
                <Input
                  value={config.primaryCta.url}
                  onChange={(e) => setConfig({ ...config, primaryCta: { ...config.primaryCta, url: e.target.value } })}
                  placeholder="/shop"
                />
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Secondary Button</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs">Label</Label>
                <Input
                  value={config.secondaryCta.label}
                  onChange={(e) => setConfig({ ...config, secondaryCta: { ...config.secondaryCta, label: e.target.value } })}
                  placeholder="View Categories"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">URL</Label>
                <Input
                  value={config.secondaryCta.url}
                  onChange={(e) => setConfig({ ...config, secondaryCta: { ...config.secondaryCta, url: e.target.value } })}
                  placeholder="/shop"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6">
        <h3 className="font-display text-lg font-bold mb-4">Live Preview</h3>
        <div className="rounded-lg overflow-hidden border border-border relative h-48 bg-muted">
          {config.imageUrl && (
            <img src={config.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative p-6 flex flex-col justify-end h-full text-white">
            <p className="text-xs tracking-widest uppercase opacity-80 mb-1">{config.subtitle}</p>
            <h4 className="text-xl font-bold mb-1">
              {config.title} <span className="text-amber-400">{config.titleAccent}</span>
            </h4>
            <p className="text-xs opacity-70 mb-3 max-w-xs">{config.description}</p>
            <div className="flex gap-2">
              <span className="bg-amber-500 text-black text-xs font-semibold px-3 py-1 rounded">
                {config.primaryCta.label}
              </span>
              <span className="border border-white/40 text-xs px-3 py-1 rounded">
                {config.secondaryCta.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="h-4 w-4 mr-1" /> Save Hero Banner
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-1" /> Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default HeroBannerEditor;
