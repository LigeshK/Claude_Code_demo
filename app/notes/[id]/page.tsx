import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getNoteById } from '@/lib/notes';
import NoteRenderer from '@/components/NoteRenderer';
import DeleteNoteButton from '@/components/DeleteNoteButton';
import ShareToggle from '@/components/ShareToggle';

export default async function NoteViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) notFound();

  const content = JSON.parse(note.contentJson) as Record<string, unknown>;

  return (
    <main className='mx-auto max-w-3xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <Link
          href='/dashboard'
          className='text-sm text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:underline transition-colors'
        >
          ← Dashboard
        </Link>
        <div className='flex items-center gap-3'>
          <ShareToggle noteId={id} initialIsPublic={note.isPublic} initialSlug={note.publicSlug} />
          <Link
            href={`/notes/${id}/edit`}
            className='rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2'
          >
            Edit
          </Link>
          <DeleteNoteButton noteId={id} />
        </div>
      </div>

      <h1 className='text-3xl font-bold mb-6 text-gray-900'>{note.title}</h1>

      <article>
        <NoteRenderer doc={content} />
      </article>
    </main>
  );
}
