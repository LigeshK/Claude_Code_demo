import { nanoid } from "nanoid";
import { get, query, run } from "./db";

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: Boolean(row.is_public),
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createNote(
  userId: string,
  data: { title?: string; contentJson?: string } = {}
): Note {
  const id = nanoid();
  const title = data.title ?? "Untitled note";
  const contentJson =
    data.contentJson ?? JSON.stringify({ type: "doc", content: [] });
  const now = new Date().toISOString();
  run(
    `INSERT INTO notes (id, user_id, title, content_json, is_public, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`,
    [id, userId, title, contentJson, now, now]
  );
  return toNote(get<NoteRow>("SELECT * FROM notes WHERE id = ?", [id])!);
}

export function getNoteById(userId: string, noteId: string): Note | null {
  const row = get<NoteRow>(
    "SELECT * FROM notes WHERE id = ? AND user_id = ?",
    [noteId, userId]
  );
  return row ? toNote(row) : null;
}

export function getNotesByUser(userId: string): Note[] {
  return query<NoteRow>(
    "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
    [userId]
  ).map(toNote);
}

export function updateNote(
  userId: string,
  noteId: string,
  data: Partial<{ title: string; contentJson: string }>
): Note | null {
  const existing = getNoteById(userId, noteId);
  if (!existing) return null;
  const title = data.title ?? existing.title;
  const contentJson = data.contentJson ?? existing.contentJson;
  const now = new Date().toISOString();
  run(
    "UPDATE notes SET title = ?, content_json = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    [title, contentJson, now, noteId, userId]
  );
  return toNote(get<NoteRow>("SELECT * FROM notes WHERE id = ?", [noteId])!);
}

export function deleteNote(userId: string, noteId: string): void {
  run("DELETE FROM notes WHERE id = ? AND user_id = ?", [noteId, userId]);
}

export function setNotePublic(
  userId: string,
  noteId: string,
  isPublic: boolean
): Note | null {
  const existing = getNoteById(userId, noteId);
  if (!existing) return null;
  const now = new Date().toISOString();
  if (isPublic) {
    const slug = existing.publicSlug ?? nanoid(16);
    run(
      "UPDATE notes SET is_public = 1, public_slug = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      [slug, now, noteId, userId]
    );
  } else {
    run(
      "UPDATE notes SET is_public = 0, public_slug = NULL, updated_at = ? WHERE id = ? AND user_id = ?",
      [now, noteId, userId]
    );
  }
  return toNote(get<NoteRow>("SELECT * FROM notes WHERE id = ?", [noteId])!);
}

export function getNoteByPublicSlug(slug: string): Note | null {
  const row = get<NoteRow>(
    "SELECT * FROM notes WHERE public_slug = ? AND is_public = 1",
    [slug]
  );
  return row ? toNote(row) : null;
}
