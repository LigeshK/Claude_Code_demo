import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getNoteById } from '@/lib/notes';
import NoteEditorClient from '@/components/NoteEditorClient';
import ShareToggle from '@/components/ShareToggle';
import DeleteNoteButton from '@/components/DeleteNoteButton';

export default async function NoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) notFound();

  const initialContent = JSON.parse(note.contentJson) as Record<string, unknown>;

  return (
    <main className='mx-auto max-w-3xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <Link
          href={`/notes/${id}`}
          className='text-sm text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:underline transition-colors'
        >
          ← View note
        </Link>
        <div className='flex items-center gap-4'>
          <ShareToggle noteId={id} initialIsPublic={note.isPublic} initialSlug={note.publicSlug} />
          <DeleteNoteButton noteId={id} />
        </div>
      </div>

      <NoteEditorClient noteId={id} initialTitle={note.title} initialContent={initialContent} />
    </main>
  );
}
