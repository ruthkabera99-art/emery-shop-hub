import { useAdminHomepage, defaultHomepageConfig, HomepageSection } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Eye, EyeOff, GripVertical, Layout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SECTION_ICONS: Record<string, string> = {
  hero: "🖼️",
  trust: "🛡️",
  categories: "📂",
  featured: "⭐",
  arrivals: "🆕",
  testimonials: "💬",
  newsletter: "📧",
};

const SortableSectionItem = ({
  section,
  onToggle,
}: {
  section: HomepageSection;
  onToggle: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
        section.visible ? "border-border bg-background" : "border-border/50 bg-muted/30 opacity-50"
      } ${isDragging ? "shadow-elevated" : ""}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <span className="text-xl">{SECTION_ICONS[section.id] || "📄"}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{section.label}</p>
        <p className="text-xs text-muted-foreground">{section.visible ? "Visible on homepage" : "Hidden"}</p>
      </div>
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onToggle(section.id)}>
        {section.visible ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4" />}
      </Button>
    </div>
  );
};

const HomepageEditor = () => {
  const { config, setConfig, save } = useAdminHomepage();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSave = async () => {
    await save(config);
    toast({ title: "Homepage Saved", description: "Homepage layout saved. Changes apply in real-time." });
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = config.sections.findIndex((s) => s.id === active.id);
    const newIndex = config.sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newSections = arrayMove(config.sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
    setConfig({ ...config, sections: newSections });
  };

  const visibleCount = config.sections.filter((s) => s.visible).length;
  const totalCount = config.sections.length;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Homepage Layout</h1>
      <p className="text-sm text-muted-foreground mb-8">Drag sections to reorder and toggle their visibility on the homepage.</p>

      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            <Layout className="h-5 w-5 text-accent" /> Sections ({visibleCount}/{totalCount} visible)
          </h3>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={config.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {config.sections.map((section) => (
                <SortableSectionItem key={section.id} section={section} onToggle={toggleSection} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
