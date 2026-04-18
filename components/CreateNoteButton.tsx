"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateNoteButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setIsPending(true);
    setError(null);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      setError("Failed to create note. Please try again.");
      setIsPending(false);
      return;
    }
    const note = await res.json();
    router.push(`/notes/${note.id}`);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handleCreate}
        disabled={isPending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Creating…" : "New note"}
      </button>
    </div>
  );
}
