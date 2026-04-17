import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import NoteEditor from "@/components/NoteEditor";
import ShareToggle from "@/components/ShareToggle";
import DeleteNoteButton from "@/components/DeleteNoteButton";
import LogoutButton from "@/components/LogoutButton";

export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession(await headers());
  if (!session) redirect("/login");

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) notFound();

  const initialContent = JSON.parse(note.contentJson) as object;

  return (
    <>
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:underline transition-colors"
          >
            ← Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <DeleteNoteButton noteId={id} />
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <ShareToggle
            noteId={id}
            initialIsPublic={note.isPublic}
            initialSlug={note.publicSlug}
          />
        </div>

        <NoteEditor
          noteId={id}
          initialTitle={note.title}
          initialContent={initialContent}
        />
      </main>
    </>
  );
}
