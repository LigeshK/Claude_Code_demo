import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeNote, makeSession } from '@/lib/__tests__/test-utils';

const { mockGetSession, mockGetNoteById, mockUpdateNote, mockDeleteNote } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockGetNoteById: vi.fn(),
  mockUpdateNote: vi.fn(),
  mockDeleteNote: vi.fn(),
}));

vi.mock('next/headers', () => ({ headers: vi.fn(() => new Headers()) }));
vi.mock('@/lib/auth', () => ({ getSession: mockGetSession }));
vi.mock('@/lib/notes', () => ({
  getNoteById: mockGetNoteById,
  updateNote: mockUpdateNote,
  deleteNote: mockDeleteNote,
}));

import { DELETE, GET, PUT } from '../route';

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request('http://localhost/api/notes/n1');

    const res = await GET(req as never, ctx('n1'));

    expect(res.status).toBe(401);
  });

  it('returns 404 when note not found', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockGetNoteById.mockReturnValue(null);
    const req = new Request('http://localhost/api/notes/missing');

    const res = await GET(req as never, ctx('missing'));

    expect(res.status).toBe(404);
  });

  it('returns 200 with the full note including contentJson', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    const note = makeNote({ id: 'n1', contentJson: '{"type":"doc"}' });
    mockGetNoteById.mockReturnValue(note);
    const req = new Request('http://localhost/api/notes/n1');

    const res = await GET(req as never, ctx('n1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe('n1');
    expect(body.contentJson).toBe('{"type":"doc"}');
  });

  it('calls getNoteById with session userId and route param id', async () => {
    mockGetSession.mockResolvedValue(makeSession({ user: { id: 'u-7' } }));
    mockGetNoteById.mockReturnValue(makeNote());
    const req = new Request('http://localhost/api/notes/note-42');

    await GET(req as never, ctx('note-42'));

    expect(mockGetNoteById).toHaveBeenCalledWith('u-7', 'note-42');
  });
});

describe('PUT /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request('http://localhost/api/notes/n1', { method: 'PUT', body: '{}' });

    const res = await PUT(req as never, ctx('n1'));

    expect(res.status).toBe(401);
  });

  it('returns 404 when note not found', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockUpdateNote.mockReturnValue(null);
    const req = new Request('http://localhost/api/notes/missing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated' }),
    });

    const res = await PUT(req as never, ctx('missing'));

    expect(res.status).toBe(404);
  });

  it('returns 200 with updated note', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    const updated = makeNote({ title: 'Updated Title' });
    mockUpdateNote.mockReturnValue(updated);
    const req = new Request('http://localhost/api/notes/n1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    const res = await PUT(req as never, ctx('n1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.title).toBe('Updated Title');
  });

  it('calls updateNote with userId, id, and body fields', async () => {
    mockGetSession.mockResolvedValue(makeSession({ user: { id: 'u-5' } }));
    mockUpdateNote.mockReturnValue(makeNote());
    const req = new Request('http://localhost/api/notes/n99', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Title' }),
    });

    await PUT(req as never, ctx('n99'));

    expect(mockUpdateNote).toHaveBeenCalledWith(
      'u-5',
      'n99',
      expect.objectContaining({ title: 'New Title' }),
    );
  });
});

describe('DELETE /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request('http://localhost/api/notes/n1', { method: 'DELETE' });

    const res = await DELETE(req as never, ctx('n1'));

    expect(res.status).toBe(401);
  });

  it('returns 404 when note not found', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockGetNoteById.mockReturnValue(null);
    const req = new Request('http://localhost/api/notes/missing', { method: 'DELETE' });

    const res = await DELETE(req as never, ctx('missing'));

    expect(res.status).toBe(404);
  });

  it('returns 204 on successful delete', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockGetNoteById.mockReturnValue(makeNote({ id: 'n1' }));
    mockDeleteNote.mockReturnValue(undefined);
    const req = new Request('http://localhost/api/notes/n1', { method: 'DELETE' });

    const res = await DELETE(req as never, ctx('n1'));

    expect(res.status).toBe(204);
  });

  it('calls deleteNote with userId and note id', async () => {
    mockGetSession.mockResolvedValue(makeSession({ user: { id: 'u-3' } }));
    mockGetNoteById.mockReturnValue(makeNote({ id: 'n1' }));
    const req = new Request('http://localhost/api/notes/n1', { method: 'DELETE' });

    await DELETE(req as never, ctx('n1'));

    expect(mockDeleteNote).toHaveBeenCalledWith('u-3', 'n1');
  });
});
