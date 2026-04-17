import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getNotesByUser } from "@/lib/notes";
import NoteList from "@/components/NoteList";
import LogoutButton from "@/components/LogoutButton";
import CreateNoteButton from "@/components/CreateNoteButton";

export const metadata = { title: "Dashboard – NoteSpace" };

export default async function DashboardPage() {
  const session = await getSession(await headers());
  if (!session) redirect("/login");

  const notes = getNotesByUser(session.user.id);

  return (
    <>
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-sm font-semibold text-gray-900">
            NoteSpace
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">{session.user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">My Notes</h1>
          <CreateNoteButton />
        </header>

        <section aria-label="Notes list">
          <NoteList notes={notes} />
        </section>
      </main>
    </>
  );
}
