'use client';

import { useActionState, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  Code,
  SquareCode,
  Minus,
} from 'lucide-react';
import { createNoteAction } from '@/app/notes/new/actions';

const EMPTY_DOC = JSON.stringify({ type: 'doc', content: [] });

const btn =
  'rounded px-2 py-1 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 aria-pressed:bg-indigo-100 aria-pressed:text-indigo-700';

export default function NewNoteForm() {
  const [, action, isPending] = useActionState(createNoteAction, null);
  const [contentJson, setContentJson] = useState(EMPTY_DOC);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    content: { type: 'doc', content: [] },
    editorProps: {
      attributes: {
        class: 'min-h-48 focus:outline-none px-1 py-2 text-sm text-gray-800 leading-relaxed',
        'aria-label': 'Note content',
        'aria-multiline': 'true',
        role: 'textbox',
      },
    },
    onUpdate({ editor }) {
      setContentJson(JSON.stringify(editor.getJSON()));
    },
  });

  return (
    <form action={action} className='flex flex-col gap-6'>
      {/* Title */}
      <div className='flex flex-col gap-1.5'>
        <label htmlFor='title' className='text-sm font-medium text-gray-700'>
          Title
        </label>
        <input
          id='title'
          name='title'
          type='text'
          required
          autoFocus
          autoComplete='off'
          placeholder='Note title'
          className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus-visible:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900'
        />
      </div>

      {/* Rich text content */}
      <div className='flex flex-col gap-1.5'>
        <span id='content-label' className='text-sm font-medium text-gray-700'>
          Content
        </span>

        <div
          aria-labelledby='content-label'
          className='rounded-lg border border-gray-300 bg-white focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900 transition-colors'
        >
          {/* Toolbar */}
          {editor && (
            <div
              role='toolbar'
              aria-label='Text formatting'
              aria-controls='editor-content'
              className='flex flex-wrap items-center gap-0.5 border-b border-gray-100 px-2 py-1.5'
            >
              <button
                type='button'
                aria-label='Bold'
                title='Bold (Ctrl+B)'
                aria-pressed={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={btn}
              >
                <Bold size={16} />
              </button>
              <button
                type='button'
                aria-label='Italic'
                title='Italic (Ctrl+I)'
                aria-pressed={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={btn}
              >
                <Italic size={16} />
              </button>
              <span className='mx-1 h-4 w-px bg-gray-200' aria-hidden='true' />
              <button
                type='button'
                aria-label='Heading 1'
                title='Heading 1 (Ctrl+Alt+1)'
                aria-pressed={editor.isActive('heading', { level: 1 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={btn}
              >
                <Heading1 size={16} />
              </button>
              <button
                type='button'
                aria-label='Heading 2'
                title='Heading 2 (Ctrl+Alt+2)'
                aria-pressed={editor.isActive('heading', { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={btn}
              >
                <Heading2 size={16} />
              </button>
              <button
                type='button'
                aria-label='Heading 3'
                title='Heading 3 (Ctrl+Alt+3)'
                aria-pressed={editor.isActive('heading', { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={btn}
              >
                <Heading3 size={16} />
              </button>
              <button
                type='button'
                aria-label='Paragraph'
                title='Paragraph (Ctrl+Alt+0)'
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={btn}
              >
                <Pilcrow size={16} />
              </button>
              <span className='mx-1 h-4 w-px bg-gray-200' aria-hidden='true' />
              <button
                type='button'
                aria-label='Bullet list'
                title='Bullet list (Ctrl+Shift+8)'
                aria-pressed={editor.isActive('bulletList')}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={btn}
              >
                <List size={16} />
              </button>
              <span className='mx-1 h-4 w-px bg-gray-200' aria-hidden='true' />
              <button
                type='button'
                aria-label='Inline code'
                title='Inline code (Ctrl+E)'
                aria-pressed={editor.isActive('code')}
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={btn}
              >
                <Code size={16} />
              </button>
              <button
                type='button'
                aria-label='Code block'
                title='Code block (Ctrl+Alt+C)'
                aria-pressed={editor.isActive('codeBlock')}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={btn}
              >
                <SquareCode size={16} />
              </button>
              <button
                type='button'
                aria-label='Horizontal rule'
                title='Horizontal rule'
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className={btn}
              >
                <Minus size={16} />
              </button>
            </div>
          )}

          {/* Editor */}
          <div id='editor-content' className='px-3 py-2'>
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Hidden field carrying the TipTap JSON */}
        <input type='hidden' name='contentJson' value={contentJson} />
      </div>

      {/* Actions */}
      <div className='flex items-center gap-3'>
        <button
          type='submit'
          disabled={isPending}
          aria-busy={isPending}
          className='rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isPending ? 'Creating…' : 'Create note'}
        </button>
        <a
          href='/dashboard'
          className='text-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:underline transition-colors'
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
