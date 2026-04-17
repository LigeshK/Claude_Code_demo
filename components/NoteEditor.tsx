"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  noteId: string;
  initialTitle: string;
  initialContent: object;
};

const SAVE_DELAY_MS = 1000;

export default function NoteEditor({ noteId, initialTitle, initialContent }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
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
      scheduleSave(title, editor.getJSON());
    },
  });

  function scheduleSave(currentTitle: string, currentContent: object) {
    setSaveState("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(currentTitle, currentContent), SAVE_DELAY_MS);
  }

  async function save(currentTitle: string, currentContent: object) {
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
    scheduleSave(next, editor?.getJSON() ?? initialContent);
  }

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (!editor) return null;

  const btn =
    "rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 aria-pressed:bg-gray-200 aria-pressed:text-gray-900 text-gray-600";

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
        <button aria-label="Bold" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} className={btn}>B</button>
        <button aria-label="Italic" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btn} italic`}>I</button>
        <span className="w-px h-4 bg-gray-200 mx-1" aria-hidden="true" />
        <button aria-label="Heading 1" aria-pressed={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn}>H1</button>
        <button aria-label="Heading 2" aria-pressed={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn}>H2</button>
        <button aria-label="Heading 3" aria-pressed={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn}>H3</button>
        <button aria-label="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} className={btn}>¶</button>
        <span className="w-px h-4 bg-gray-200 mx-1" aria-hidden="true" />
        <button aria-label="Bullet list" aria-pressed={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn}>• List</button>
        <span className="w-px h-4 bg-gray-200 mx-1" aria-hidden="true" />
        <button aria-label="Inline code" aria-pressed={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} className={btn}>`code`</button>
        <button aria-label="Code block" aria-pressed={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn}>```</button>
        <button aria-label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn}>—</button>
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
