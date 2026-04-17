"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    setIsPending(true);
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-500 hover:text-red-700 focus-visible:outline-none focus-visible:underline disabled:opacity-50 transition-colors"
    >
      {isPending ? "Deleting…" : "Delete note"}
    </button>
  );
}
