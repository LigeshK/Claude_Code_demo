import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeNote, makeSession } from '@/lib/__tests__/test-utils';

const { mockGetSession, mockSetNotePublic } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockSetNotePublic: vi.fn(),
}));

vi.mock('next/headers', () => ({ headers: vi.fn(() => new Headers()) }));
vi.mock('@/lib/auth', () => ({ getSession: mockGetSession }));
vi.mock('@/lib/notes', () => ({ setNotePublic: mockSetNotePublic }));

import { POST } from '../route';

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

function makeReq(id: string, body: unknown) {
  return new Request(`http://localhost/api/notes/${id}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/notes/[id]/share', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await POST(makeReq('n1', { isPublic: true }) as never, ctx('n1'));

    expect(res.status).toBe(401);
  });

  it('returns 400 when body is missing isPublic', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    const req = new Request('http://localhost/api/notes/n1/share', { method: 'POST', body: 'bad' });

    const res = await POST(req as never, ctx('n1'));

    expect(res.status).toBe(400);
  });

  it('returns 400 when isPublic is not a boolean', async () => {
    mockGetSession.mockResolvedValue(makeSession());

    const res = await POST(makeReq('n1', { isPublic: 'yes' }) as never, ctx('n1'));

    expect(res.status).toBe(400);
  });

  it('returns 404 when note not found', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockSetNotePublic.mockReturnValue(null);

    const res = await POST(makeReq('missing', { isPublic: true }) as never, ctx('missing'));

    expect(res.status).toBe(404);
  });

  it('returns 200 with id, isPublic, publicSlug when enabling sharing', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    const note = makeNote({ id: 'n1', isPublic: true, publicSlug: 'abc123456789abcd' });
    mockSetNotePublic.mockReturnValue(note);

    const res = await POST(makeReq('n1', { isPublic: true }) as never, ctx('n1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ id: 'n1', isPublic: true, publicSlug: 'abc123456789abcd' });
  });

  it('returns 200 with null publicSlug when disabling sharing', async () => {
    mockGetSession.mockResolvedValue(makeSession());
    const note = makeNote({ id: 'n1', isPublic: false, publicSlug: null });
    mockSetNotePublic.mockReturnValue(note);

    const res = await POST(makeReq('n1', { isPublic: false }) as never, ctx('n1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ id: 'n1', isPublic: false, publicSlug: null });
  });

  it('calls setNotePublic with userId, note id, and isPublic value', async () => {
    mockGetSession.mockResolvedValue(makeSession({ user: { id: 'u-8' } }));
    mockSetNotePublic.mockReturnValue(makeNote({ isPublic: true, publicSlug: 'slug' }));

    await POST(makeReq('note-77', { isPublic: true }) as never, ctx('note-77'));

    expect(mockSetNotePublic).toHaveBeenCalledWith('u-8', 'note-77', true);
  });
});
