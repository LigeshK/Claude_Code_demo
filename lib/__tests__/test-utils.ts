import type { Note } from '../notes';

type RawNote = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

export function makeRawNote(overrides: Partial<RawNote> = {}): RawNote {
  return {
    id: 'note-1',
    user_id: 'user-1',
    title: 'Test Note',
    content_json: JSON.stringify({ type: 'doc', content: [] }),
    is_public: 0,
    public_slug: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    userId: 'user-1',
    title: 'Test Note',
    contentJson: JSON.stringify({ type: 'doc', content: [] }),
    isPublic: false,
    publicSlug: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
    ...overrides,
  };
}
