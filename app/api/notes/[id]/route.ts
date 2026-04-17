import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteNote, getNoteById, updateNote } from "@/lib/notes";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getSession(await headers());
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(note);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getSession(await headers());
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const note = updateNote(session.user.id, id, {
    title: body.title,
    contentJson: body.contentJson ? JSON.stringify(body.contentJson) : undefined,
  });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(note);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getSession(await headers());
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  deleteNote(session.user.id, id);
  return new NextResponse(null, { status: 204 });
}
