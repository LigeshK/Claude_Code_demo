"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateNoteButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleCreate() {
    setIsPending(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const note = await res.json();
    router.push(`/notes/${note.id}`);
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isPending}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
    >
      {isPending ? "Creating…" : "New note"}
    </button>
  );
}
