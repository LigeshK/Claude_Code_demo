import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">NoteSpace</h1>
        <p className="text-gray-500">Your personal note-taking space.</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=register"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
