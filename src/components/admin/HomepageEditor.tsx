import { useAdminHomepage, defaultHomepageConfig, HomepageSection } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Eye, EyeOff, ArrowUp, ArrowDown, Layout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SECTION_ICONS: Record<string, string> = {
  hero: "🖼️",
  trust: "🛡️",
  categories: "📂",
  featured: "⭐",
  arrivals: "🆕",
  testimonials: "💬",
  newsletter: "📧",
};

const HomepageEditor = () => {
  const { config, setConfig, save } = useAdminHomepage();
  const { toast } = useToast();

  const handleSave = async () => {
    await save(config);
    toast({ title: "Homepage Saved", description: "Homepage layout saved. Refresh the store to see changes." });
  };

  const handleReset = () => {
    setConfig(defaultHomepageConfig);
    toast({ title: "Homepage Reset", description: "Layout reset to defaults. Click Save to apply." });
  };

  const toggleSection = (id: string) => {
    const sections = config.sections.map((s) =>
      s.id === id ? { ...s, visible: !s.visible } : s
    );
    setConfig({ ...config, sections });
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const sections = [...config.sections];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;
    // Swap orders
    const tempOrder = sections[index].order;
    sections[index] = { ...sections[index], order: sections[newIndex].order };
    sections[newIndex] = { ...sections[newIndex], order: tempOrder };
    // Swap positions
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    setConfig({ ...config, sections });
  };

  const visibleCount = config.sections.filter((s) => s.visible).length;
  const totalCount = config.sections.length;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Homepage Layout</h1>
      <p className="text-sm text-muted-foreground mb-8">Toggle and reorder homepage sections. Drag sections to rearrange the layout.</p>

      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            <Layout className="h-5 w-5 text-accent" /> Sections ({visibleCount}/{totalCount} visible)
          </h3>
        </div>
        <div className="space-y-2">
          {config.sections.map((section, i) => (
            <div
              key={section.id}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                section.visible
                  ? "border-border bg-background"
                  : "border-border/50 bg-muted/30 opacity-50"
              }`}
            >
              <span className="text-xl">{SECTION_ICONS[section.id] || "📄"}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{section.label}</p>
                <p className="text-xs text-muted-foreground">{section.visible ? "Visible on homepage" : "Hidden"}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveSection(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveSection(i, 1)} disabled={i === config.sections.length - 1}>
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleSection(section.id)}>
                  {section.visible ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout Preview */}
      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-2xl">
        <h3 className="font-display text-lg font-bold mb-4">Layout Preview</h3>
        <div className="space-y-2">
          <div className="p-2 bg-primary/10 rounded text-xs font-medium text-center">Navbar (always visible)</div>
          {config.sections
            .filter((s) => s.visible)
            .map((s) => (
              <div key={s.id} className="p-3 bg-accent/10 rounded border border-accent/20 text-sm font-medium text-center">
                {SECTION_ICONS[s.id]} {s.label}
              </div>
            ))}
          <div className="p-2 bg-primary/10 rounded text-xs font-medium text-center">Footer (always visible)</div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="h-4 w-4 mr-1" /> Save Layout
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-1" /> Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default HomepageEditor;
