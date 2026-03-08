import { useAdminMenu, defaultMenuConfig } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, RefreshCw, Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
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

interface MenuItem {
  label: string;
  url: string;
  visible: boolean;
}

const SortableMenuItem = ({
  item,
  index,
  onUpdate,
  onToggle,
  onRemove,
}: {
  item: MenuItem;
  index: number;
  onUpdate: (index: number, field: "label" | "url", value: string) => void;
  onToggle: (index: number) => void;
  onRemove: (index: number) => void;
}) => {
  const id = `menu-${index}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
        item.visible ? "border-border bg-background" : "border-border/50 bg-muted/50 opacity-60"
      } ${isDragging ? "shadow-elevated" : ""}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
      <div className="flex-1 grid grid-cols-2 gap-2">
        <Input value={item.label} onChange={(e) => onUpdate(index, "label", e.target.value)} placeholder="Label" />
        <Input value={item.url} onChange={(e) => onUpdate(index, "url", e.target.value)} placeholder="/path" />
      </div>
      <div className="flex gap-1 shrink-0">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onToggle(index)}>
          {item.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onRemove(index)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const MenuEditor = () => {
  const { config, setConfig, save } = useAdminMenu();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSave = async () => {
    await save(config);
    toast({ title: "Menu Saved", description: "Navigation menu saved. Changes apply in real-time." });
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(String(active.id).replace("menu-", ""));
    const newIndex = Number(String(over.id).replace("menu-", ""));
    setConfig({ ...config, items: arrayMove(config.items, oldIndex, newIndex) });
  };

  const sortableIds = config.items.map((_, i) => `menu-${i}`);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Menu Editor</h1>
      <p className="text-sm text-muted-foreground mb-8">Drag items to reorder, toggle visibility, or add new navigation links.</p>

      <div className="bg-card rounded-lg p-6 shadow-soft mb-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold">Navigation Items</h3>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {config.items.map((item, i) => (
                <SortableMenuItem
                  key={`menu-${i}`}
                  item={item}
                  index={i}
                  onUpdate={updateItem}
                  onToggle={toggleVisibility}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
