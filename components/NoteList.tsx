import Link from "next/link";

type NoteItem = {
  id: string;
  title: string;
  isPublic: boolean;
  updatedAt: string;
};

export default function NoteList({ notes }: { notes: NoteItem[] }) {
  if (notes.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-12 text-center">
        No notes yet — create your first one.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {notes.map((note) => (
        <li key={note.id}>
          <Link
            href={`/notes/${note.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-900 truncate">
              {note.title || "Untitled note"}
            </span>
            <span className="flex items-center gap-3 shrink-0 text-xs text-gray-400">
              {note.isPublic && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 font-medium">
                  Public
                </span>
              )}
              <time dateTime={note.updatedAt}>
                {new Date(note.updatedAt).toLocaleDateString()}
              </time>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
