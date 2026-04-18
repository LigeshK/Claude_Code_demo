import { notFound } from "next/navigation";
import Link from "next/link";
import { getNoteByPublicSlug } from "@/lib/notes";
import PublicNoteViewer from "@/components/PublicNoteViewer";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);
  return { title: note ? `${note.title} – NoteSpace` : "Note not found" };
}

export default async function PublicNotePage({ params }: Props) {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);
  if (!note) notFound();

  const content = JSON.parse(note.contentJson) as Record<string, unknown>;

  return (
    <>
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-3">
          <Link href="/" className="text-sm font-semibold text-gray-900">
            NoteSpace
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <article>
          <h1 className="mb-6 text-2xl font-bold text-gray-900">{note.title}</h1>
          <PublicNoteViewer content={content} />
        </article>
      </main>
    </>
  );
}
