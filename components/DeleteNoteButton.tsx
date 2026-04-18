"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    setIsPending(true);
    setError(null);
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete. Please try again.");
      setIsPending(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm text-red-500 hover:text-red-700 focus-visible:outline-none focus-visible:underline disabled:opacity-50 transition-colors"
      >
        {isPending ? "Deleting…" : "Delete note"}
      </button>
    </div>
  );
}
