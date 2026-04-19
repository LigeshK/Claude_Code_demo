import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { setNotePublic } from '@/lib/notes';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(await headers());
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.isPublic !== 'boolean') {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const note = setNotePublic(session.user.id, id, body.isPublic);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: note.id,
    isPublic: note.isPublic,
    publicSlug: note.publicSlug,
  });
}
