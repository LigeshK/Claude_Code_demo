import Link from 'next/link';
import DeleteNoteButton from '@/components/DeleteNoteButton';

type NoteItem = {
  id: string;
  title: string;
  isPublic: boolean;
  updatedAt: string;
};

export default function NoteList({ notes }: { notes: NoteItem[] }) {
  if (notes.length === 0) {
    return (
      <p className='text-sm text-gray-400 py-12 text-center'>
        No notes yet — create your first one.
      </p>
    );
  }

  return (
    <ul className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      {notes.map((note) => (
        <li
          key={note.id}
          className='flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow'
        >
          <Link
            href={`/notes/${note.id}`}
            className='flex-1 font-medium text-gray-900 hover:text-indigo-700 transition-colors mb-4 focus-visible:outline-none focus-visible:underline line-clamp-2'
          >
            {note.title || 'Untitled note'}
          </Link>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 text-xs text-gray-400'>
              {note.isPublic && (
                <span className='rounded-full bg-green-100 px-2 py-0.5 text-green-700 font-medium'>
                  Public
                </span>
              )}
              <time dateTime={note.updatedAt}>{new Date(note.updatedAt).toLocaleDateString()}</time>
            </div>
            <div className='flex items-center gap-3 shrink-0'>
              <Link
                href={`/notes/${note.id}/edit`}
                className='text-sm text-gray-500 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:underline'
              >
                Edit
              </Link>
              <DeleteNoteButton noteId={note.id} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
