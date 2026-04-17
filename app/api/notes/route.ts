import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createNote, getNotesByUser } from "@/lib/notes";

export async function GET() {
  const session = await getSession(await headers());
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = getNotesByUser(session.user.id);
  return NextResponse.json(
    notes.map((n) => ({
      id: n.id,
      title: n.title,
      isPublic: n.isPublic,
      updatedAt: n.updatedAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession(await headers());
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const note = createNote(session.user.id, {
    title: body.title,
    contentJson: body.contentJson ? JSON.stringify(body.contentJson) : undefined,
  });
  return NextResponse.json(note, { status: 201 });
}
