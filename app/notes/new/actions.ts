"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createNote } from "@/lib/notes";

export async function createNoteAction(_prev: unknown, formData: FormData) {
  const session = await requireAuth();

  const title = (formData.get("title") as string | null)?.trim() || "Untitled note";
  const contentJson = (formData.get("contentJson") as string | null) ?? undefined;

  const note = createNote(session.user.id, { title, contentJson });

  redirect(`/notes/${note.id}`);
}
