import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getNotesByUser } from "@/lib/notes";
import NoteList from "@/components/NoteList";

export const metadata = { title: "Dashboard – NoteSpace" };

export default async function DashboardPage() {
  const session = await requireAuth();
  const notes = getNotesByUser(session.user.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Notes</h1>
        <Link
          href="/notes/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          New Note
        </Link>
      </header>

      <section aria-label="Notes list">
        <NoteList notes={notes} />
      </section>
    </main>
  );
}
