import { useAdminTheme, defaultThemeConfig } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, RefreshCw, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FONT_OPTIONS = [
  "Playfair Display", "DM Sans", "Inter", "Poppins", "Roboto", "Montserrat",
  "Lora", "Merriweather", "Raleway", "Open Sans", "Oswald", "Nunito",
];

const PRESET_THEMES = [
  { name: "Default Warm", primary: "30 10% 15%", accent: "38 60% 55%", bg: "36 33% 97%" },
  { name: "Ocean Blue", primary: "220 30% 20%", accent: "200 80% 50%", bg: "210 20% 97%" },
  { name: "Forest Green", primary: "150 20% 15%", accent: "140 50% 45%", bg: "140 15% 97%" },
  { name: "Royal Purple", primary: "270 20% 18%", accent: "265 60% 55%", bg: "270 15% 97%" },
  { name: "Rose Gold", primary: "350 15% 18%", accent: "15 70% 60%", bg: "20 25% 97%" },
  { name: "Midnight", primary: "230 15% 12%", accent: "45 80% 55%", bg: "230 10% 96%" },
];

const ThemeCustomizer = () => {
  const { config, setConfig, save } = useAdminTheme();
  const { toast } = useToast();

  const handleSave = async () => {
    await save(config);
    toast({ title: "Theme Saved", description: "Theme settings saved. Refresh the store to see changes." });
  };

  const handleReset = () => {
    setConfig(defaultThemeConfig);
    toast({ title: "Theme Reset", description: "Theme reset to defaults. Click Save to apply." });
  };

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setConfig({ ...config, primaryColor: preset.primary, accentColor: preset.accent, backgroundColor: preset.bg });
    toast({ title: "Preset Applied", description: `"${preset.name}" applied. Click Save to persist.` });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Theme Customizer</h1>
      <p className="text-sm text-muted-foreground mb-8">Customize your store's look and feel like WordPress Appearance settings.</p>

      {/* Color Presets */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6">
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-accent" /> Color Presets
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRESET_THEMES.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent transition-colors text-left"
            >
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-full" style={{ background: `hsl(${p.primary})` }} />
                <div className="w-5 h-5 rounded-full" style={{ background: `hsl(${p.accent})` }} />
                <div className="w-5 h-5 rounded-full border" style={{ background: `hsl(${p.bg})` }} />
              </div>
              <span className="text-xs font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-lg">
        <h3 className="font-display text-lg font-bold mb-4">Custom Colors (HSL)</h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Primary Color</Label>
            <div className="flex gap-2 items-center">
              <Input value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} placeholder="30 10% 15%" />
              <div className="w-10 h-10 rounded-md border shrink-0" style={{ background: `hsl(${config.primaryColor})` }} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Accent Color</Label>
            <div className="flex gap-2 items-center">
              <Input value={config.accentColor} onChange={(e) => setConfig({ ...config, accentColor: e.target.value })} placeholder="38 60% 55%" />
              <div className="w-10 h-10 rounded-md border shrink-0" style={{ background: `hsl(${config.accentColor})` }} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Background Color</Label>
            <div className="flex gap-2 items-center">
              <Input value={config.backgroundColor} onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })} placeholder="36 33% 97%" />
              <div className="w-10 h-10 rounded-md border shrink-0" style={{ background: `hsl(${config.backgroundColor})` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-lg">
        <h3 className="font-display text-lg font-bold mb-4">Typography</h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Heading Font</Label>
            <Select value={config.fontHeading} onValueChange={(v) => setConfig({ ...config, fontHeading: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-2xl mt-2" style={{ fontFamily: config.fontHeading }}>Preview Heading</p>
          </div>
          <div>
            <Label className="mb-1.5 block">Body Font</Label>
            <Select value={config.fontBody} onValueChange={(v) => setConfig({ ...config, fontBody: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="mt-2" style={{ fontFamily: config.fontBody }}>Preview body text paragraph for this font.</p>
          </div>
          <div>
            <Label className="mb-1.5 block">Border Radius</Label>
            <Select value={config.borderRadius} onValueChange={(v) => setConfig({ ...config, borderRadius: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0rem">Sharp (0)</SelectItem>
                <SelectItem value="0.25rem">Subtle (0.25rem)</SelectItem>
                <SelectItem value="0.5rem">Default (0.5rem)</SelectItem>
                <SelectItem value="0.75rem">Rounded (0.75rem)</SelectItem>
                <SelectItem value="1rem">Very Rounded (1rem)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-lg">
        <h3 className="font-display text-lg font-bold mb-4">Live Preview</h3>
        <div className="p-6 rounded-lg border" style={{ background: `hsl(${config.backgroundColor})`, borderRadius: config.borderRadius }}>
          <h4 className="text-xl font-bold mb-2" style={{ fontFamily: config.fontHeading, color: `hsl(${config.primaryColor})` }}>
            Sample Heading
          </h4>
          <p className="text-sm mb-4" style={{ fontFamily: config.fontBody, color: `hsl(${config.primaryColor})` }}>
            This is how your store text will look with the selected fonts and colors.
          </p>
          <button
            className="px-4 py-2 text-sm font-medium text-white"
            style={{ background: `hsl(${config.accentColor})`, borderRadius: config.borderRadius }}
          >
            Sample Button
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="h-4 w-4 mr-1" /> Save Theme
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-1" /> Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
