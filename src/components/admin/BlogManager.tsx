import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBlogPosts, BlogPost } from "@/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

const emptyPost = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  author: "Emery Collection",
  tags: [] as string[],
  published: false,
};

const BlogManager = () => {
  const { data: posts = [], isLoading } = useBlogPosts(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [tagsInput, setTagsInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const openNew = () => {
    setEditing(null);
    setForm(emptyPost);
    setTagsInput("");
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      cover_image: post.cover_image || "",
      author: post.author,
      tags: post.tags,
      published: post.published,
    });
    setTagsInput(post.tags.join(", "));
    setShowForm(true);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    const slug = form.slug || generateSlug(form.title);
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      title: form.title,
      slug,
      excerpt: form.excerpt || null,
      content: form.content,
      cover_image: form.cover_image || null,
      author: form.author,
      tags,
      published: form.published,
      published_at: form.published ? new Date().toISOString() : null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("blog_posts").insert(payload));
    }

    if (error) {
      toast({ title: "Error saving post", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Post updated" : "Post created" });
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      setShowForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (!error) {
      toast({ title: "Post deleted" });
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
    }
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{editing ? "Edit Post" : "New Post"}</h3>
          <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
        <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input
          placeholder="Slug (auto-generated if empty)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <Input placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        <Textarea
          placeholder="Content (HTML supported)"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="min-h-[200px] font-mono text-sm"
        />
        <Input placeholder="Cover Image URL" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} />
        <Input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <Input placeholder="Tags (comma separated)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        <div className="flex items-center gap-3">
          <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
          <span className="text-sm">{form.published ? "Published" : "Draft"}</span>
        </div>
        <Button onClick={handleSave} className="w-full">{editing ? "Update Post" : "Create Post"}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Blog Posts ({posts.length})</h3>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New Post</Button>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No blog posts yet.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {post.published ? (
                    <Eye className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{post.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">/blog/{post.slug}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogManager;
