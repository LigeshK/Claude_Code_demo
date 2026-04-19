import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeNote, makeSession } from '@/lib/__tests__/test-utils';

const { mockGetSession, mockGetNotesByUser, mockCreateNote } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockGetNotesByUser: vi.fn(),
  mockCreateNote: vi.fn(),
}));

vi.mock('next/headers', () => ({ headers: vi.fn(() => new Headers()) }));
vi.mock('@/lib/auth', () => ({ getSession: mockGetSession }));
vi.mock('@/lib/notes', () => ({
  getNotesByUser: mockGetNotesByUser,
  createNote: mockCreateNote,
}));

import { GET, POST } from '../route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/notes', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it('returns 200 with mapped note list for authenticated user', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    const notes = [
      makeNote({ id: 'a', title: 'Note A' }),
      makeNote({ id: 'b', title: 'Note B', isPublic: true }),
    ];
    mockGetNotesByUser.mockReturnValue(notes);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({ id: 'a', title: 'Note A', isPublic: false });
    expect(body[1]).toMatchObject({ id: 'b', isPublic: true });
  });

  it('omits contentJson from list response', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockGetNotesByUser.mockReturnValue([makeNote()]);

    const res = await GET();
    const [note] = await res.json();

    expect(note).not.toHaveProperty('contentJson');
  });

  it('calls getNotesByUser with the session userId', async () => {
    mockGetSession.mockResolvedValue(makeSession({ user: { id: 'u-42' } }));
    mockGetNotesByUser.mockReturnValue([]);

    await GET();

    expect(mockGetNotesByUser).toHaveBeenCalledWith('u-42');
  });
});

describe('POST /api/notes', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request('http://localhost/api/notes', { method: 'POST', body: '{}' });

    const res = await POST(req as never);

    expect(res.status).toBe(401);
  });

  it('returns 201 with created note', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    const note = makeNote({ id: 'new-1', title: 'Brand New' });
    mockCreateNote.mockReturnValue(note);
    const req = new Request('http://localhost/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Brand New' }),
    });

    const res = await POST(req as never);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe('new-1');
    expect(body.title).toBe('Brand New');
  });

  it('calls createNote with userId from session and title from body', async () => {
    mockGetSession.mockResolvedValue(makeSession({ user: { id: 'u-99' } }));
    mockCreateNote.mockReturnValue(makeNote());
    const req = new Request('http://localhost/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'My Title' }),
    });

    await POST(req as never);

    expect(mockCreateNote).toHaveBeenCalledWith(
      'u-99',
      expect.objectContaining({ title: 'My Title' }),
    );
  });

  it('creates note with empty body without throwing', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockCreateNote.mockReturnValue(makeNote());
    const req = new Request('http://localhost/api/notes', { method: 'POST', body: 'invalid-json' });

    const res = await POST(req as never);

    expect(res.status).toBe(201);
    expect(mockCreateNote).toHaveBeenCalledWith('user-1', expect.objectContaining({}));
  });
});
