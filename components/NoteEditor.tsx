"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Heading1, Heading2, Heading3, Pilcrow, List, Code, SquareCode, Minus } from "lucide-react";

type Props = {
  noteId: string;
  initialTitle: string;
  initialContent: Record<string, unknown>;
};

const SAVE_DELAY_MS = 1000;

export default function NoteEditor({ noteId, initialTitle, initialContent }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef(initialTitle);
  const latestContentRef = useRef<Record<string, unknown>>(initialContent);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[400px] focus:outline-none px-1 py-2",
      },
    },
    onUpdate({ editor }) {
      const content = editor.getJSON() as Record<string, unknown>;
      latestContentRef.current = content;
      scheduleSave(titleRef.current, content);
    },
  });

  function scheduleSave(currentTitle: string, currentContent: Record<string, unknown>) {
    setSaveState("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(currentTitle, currentContent), SAVE_DELAY_MS);
  }

  async function save(currentTitle: string, currentContent: Record<string, unknown>) {
    setSaveState("saving");
    await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: currentTitle, contentJson: currentContent }),
    });
    setSaveState("saved");
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setTitle(next);
    titleRef.current = next;
    scheduleSave(next, editor?.getJSON() as Record<string, unknown> ?? latestContentRef.current);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        fetch(`/api/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: titleRef.current, contentJson: latestContentRef.current }),
          keepalive: true,
        });
      }
    };
  }, [noteId]);

  if (!editor) return null;

  const btn =
    "rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 aria-pressed:bg-indigo-100 aria-pressed:text-indigo-700 text-gray-600";

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        aria-label="Note title"
        placeholder="Untitled note"
        className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none border-none bg-transparent"
      />

      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap items-center gap-1 border-y border-gray-100 py-1"
      >
        <button aria-label="Bold" title="Bold (Ctrl+B)" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} className={btn}><Bold size={16} /></button>
        <button aria-label="Italic" title="Italic (Ctrl+I)" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} className={btn}><Italic size={16} /></button>
        <span className="w-px h-4 bg-gray-200 mx-1" aria-hidden="true" />
        <button aria-label="Heading 1" title="Heading 1 (Ctrl+Alt+1)" aria-pressed={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn}><Heading1 size={16} /></button>
        <button aria-label="Heading 2" title="Heading 2 (Ctrl+Alt+2)" aria-pressed={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn}><Heading2 size={16} /></button>
        <button aria-label="Heading 3" title="Heading 3 (Ctrl+Alt+3)" aria-pressed={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn}><Heading3 size={16} /></button>
        <button aria-label="Paragraph" title="Paragraph (Ctrl+Alt+0)" onClick={() => editor.chain().focus().setParagraph().run()} className={btn}><Pilcrow size={16} /></button>
        <span className="w-px h-4 bg-gray-200 mx-1" aria-hidden="true" />
        <button aria-label="Bullet list" title="Bullet list (Ctrl+Shift+8)" aria-pressed={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn}><List size={16} /></button>
        <span className="w-px h-4 bg-gray-200 mx-1" aria-hidden="true" />
        <button aria-label="Inline code" title="Inline code (Ctrl+E)" aria-pressed={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} className={btn}><Code size={16} /></button>
        <button aria-label="Code block" title="Code block (Ctrl+Alt+C)" aria-pressed={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn}><SquareCode size={16} /></button>
        <button aria-label="Horizontal rule" title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn}><Minus size={16} /></button>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Save status */}
      <p aria-live="polite" className="text-xs text-gray-400 text-right">
        {saveState === "saving" && "Saving…"}
        {saveState === "saved" && "Saved"}
        {saveState === "unsaved" && "Unsaved changes"}
      </p>
    </div>
  );
}
