import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus, Brain, Save, Sparkles, Send, RotateCcw, User, Bot } from "lucide-react";

interface TrainingEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  enabled: boolean;
  priority: number;
}

interface PreviewTurn { role: "user" | "assistant"; content: string; ms?: number }

const ChatTrainingManager = () => {
  const [entries, setEntries] = useState<TrainingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ title: "", content: "", category: "general", priority: 0 });
  const [saving, setSaving] = useState(false);
  const [previewInput, setPreviewInput] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [conversation, setConversation] = useState<PreviewTurn[]>([]);

  const resetConversation = () => {
    setConversation([]);
    setPreviewInput("");
  };

  const runPreview = async () => {
    const message = previewInput.trim();
    if (!message) {
      toast({ title: "Enter a test message first", variant: "destructive" });
      return;
    }
    const history = conversation.map(({ role, content }) => ({ role, content }));
    const userTurn: PreviewTurn = { role: "user", content: message };
    setConversation((prev) => [...prev, userTurn]);
    setPreviewInput("");
    setPreviewLoading(true);
    const started = performance.now();
    const { data, error } = await supabase.functions.invoke("chat-auto-reply", {
      body: { message, history },
    });
    const ms = Math.round(performance.now() - started);
    setPreviewLoading(false);
    if (error) {
      toast({ title: "Preview failed", description: error.message, variant: "destructive" });
      setConversation((prev) => [...prev, { role: "assistant", content: `⚠️ ${error.message}`, ms }]);
      return;
    }
    const reply = (data as { reply?: string })?.reply ?? "(no reply returned)";
    setConversation((prev) => [...prev, { role: "assistant", content: reply, ms }]);
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("chat_training")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setEntries((data ?? []) as TrainingEntry[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addEntry = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("chat_training").insert({
      title: draft.title.trim(),
      content: draft.content.trim(),
      category: draft.category.trim() || "general",
      priority: draft.priority,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
      return;
    }
    setDraft({ title: "", content: "", category: "general", priority: 0 });
    toast({ title: "Training entry added" });
    load();
  };

  const updateEntry = async (id: string, patch: Partial<TrainingEntry>) => {
    const { error } = await supabase.from("chat_training").update(patch).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this training entry?")) return;
    const { error } = await supabase.from("chat_training").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Chat AI Training</h2>
          <p className="text-sm text-muted-foreground">
            Teach the auto-reply AI about your store. Higher priority entries are emphasized first.
          </p>
        </div>
      </div>

      {/* Preview tool */}
      <Card className="p-4 space-y-3 border-primary/30">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Test the AI reply
        </h3>
        <p className="text-xs text-muted-foreground">
          Send a sample customer message and see exactly what the AI would reply using your current training entries.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. What's your return policy?"
            value={previewInput}
            onChange={(e) => setPreviewInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runPreview(); } }}
          />
          <Button onClick={runPreview} disabled={previewLoading}>
            <Send className="h-4 w-4 mr-1" />
            {previewLoading ? "Thinking…" : "Test reply"}
          </Button>
        </div>
        {previewReply !== null && (
          <div className="rounded-md bg-muted p-3 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>AI reply</span>
              {previewMs !== null && <span>{previewMs} ms</span>}
            </div>
            <p className="text-sm whitespace-pre-wrap">{previewReply}</p>
          </div>
        )}
      </Card>

      {/* New entry */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add new training</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Label>Title</Label>
            <Input
              placeholder="e.g. Return policy"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Input
              placeholder="general"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>Content / instructions</Label>
          <Textarea
            rows={4}
            placeholder="Explain the policy, fact, or behavior the AI should know about…"
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32">
            <Label>Priority</Label>
            <Input
              type="number"
              value={draft.priority}
              onChange={(e) => setDraft({ ...draft, priority: parseInt(e.target.value) || 0 })}
            />
          </div>
          <Button onClick={addEntry} disabled={saving} className="ml-auto">
            <Save className="h-4 w-4 mr-1" /> Add entry
          </Button>
        </div>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No training entries yet.</p>
        ) : (
          entries.map((e) => (
            <Card key={e.id} className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  className="font-semibold"
                  value={e.title}
                  onChange={(ev) => setEntries((prev) => prev.map((x) => x.id === e.id ? { ...x, title: ev.target.value } : x))}
                  onBlur={(ev) => updateEntry(e.id, { title: ev.target.value })}
                />
                <Input
                  className="w-32"
                  value={e.category}
                  onChange={(ev) => setEntries((prev) => prev.map((x) => x.id === e.id ? { ...x, category: ev.target.value } : x))}
                  onBlur={(ev) => updateEntry(e.id, { category: ev.target.value })}
                />
                <Input
                  className="w-20"
                  type="number"
                  value={e.priority}
                  onChange={(ev) => setEntries((prev) => prev.map((x) => x.id === e.id ? { ...x, priority: parseInt(ev.target.value) || 0 } : x))}
                  onBlur={(ev) => updateEntry(e.id, { priority: parseInt(ev.target.value) || 0 })}
                />
                <div className="flex items-center gap-2">
                  <Switch checked={e.enabled} onCheckedChange={(v) => updateEntry(e.id, { enabled: v })} />
                  <span className="text-xs text-muted-foreground">{e.enabled ? "On" : "Off"}</span>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteEntry(e.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Textarea
                rows={3}
                value={e.content}
                onChange={(ev) => setEntries((prev) => prev.map((x) => x.id === e.id ? { ...x, content: ev.target.value } : x))}
                onBlur={(ev) => updateEntry(e.id, { content: ev.target.value })}
              />
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatTrainingManager;
