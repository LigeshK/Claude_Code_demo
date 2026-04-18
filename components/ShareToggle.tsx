"use client";

import { useEffect, useState } from "react";

type Props = {
  noteId: string;
  initialIsPublic: boolean;
  initialSlug: string | null;
};

export default function ShareToggle({ noteId, initialIsPublic, initialSlug }: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [slug, setSlug] = useState(initialSlug);
  const [isPending, setIsPending] = useState(false);
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const publicUrl = isPublic && slug && origin ? `${origin}/p/${slug}` : null;

  async function toggle() {
    setIsPending(true);
    setError(null);
    const next = !isPublic;
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setIsPublic(data.isPublic);
      setSlug(data.publicSlug);
    } catch {
      setError("Failed to update sharing. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <span className="text-sm font-medium text-gray-700">Share publicly</span>
        <button
          role="switch"
          aria-checked={isPublic}
          onClick={toggle}
          disabled={isPending}
          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:opacity-50 aria-checked:bg-gray-900 bg-gray-300"
        >
          <span
            className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
            aria-hidden="true"
            style={{ transform: isPublic ? "translateX(1.1rem)" : "translateX(0.125rem)" }}
          />
        </button>
      </label>

      {isPublic && publicUrl && (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={publicUrl}
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 focus-visible:outline-none"
            aria-label="Public note URL"
          />
          <button
            onClick={() => navigator.clipboard.writeText(publicUrl)}
            className="text-xs text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:underline transition-colors shrink-0"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
