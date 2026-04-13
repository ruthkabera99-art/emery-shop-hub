import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading1, Heading2, Heading3,
  Quote, Code, Link as LinkIcon, ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Minus,
} from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const ToolbarButton = ({ onClick, active, children, title }: {
  onClick: () => void; active?: boolean; children: React.ReactNode; title: string;
}) => (
  <Button
    type="button"
    variant={active ? "default" : "outline"}
    size="icon"
    className="h-7 w-7"
    onClick={onClick}
    title={title}
  >
    {children}
  </Button>
);

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b bg-muted/50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="w-px bg-border mx-0.5" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="w-px bg-border mx-0.5" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <Code className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="w-px bg-border mx-0.5" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="w-px bg-border mx-0.5" />
        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Add Link">
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Add Image">
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="w-px bg-border mx-0.5" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-3 min-h-[200px] focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[180px]" />
    </div>
  );
};

export default RichTextEditor;
