import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeRawNote } from './test-utils';

const { mockGet, mockQuery, mockRun, mockNanoid } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockQuery: vi.fn(),
  mockRun: vi.fn(),
  mockNanoid: vi.fn(() => 'mocked-id'),
}));

vi.mock('../db', () => ({ get: mockGet, query: mockQuery, run: mockRun }));
vi.mock('nanoid', () => ({ nanoid: mockNanoid }));

import {
  createNote,
  deleteNote,
  getNoteById,
  getNotesByUser,
  getNoteByPublicSlug,
  setNotePublic,
  updateNote,
} from '../notes';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createNote', () => {
  it('returns a Note with camelCase fields (validates toNote conversion)', () => {
    const raw = makeRawNote({ id: 'mocked-id', user_id: 'u1', is_public: 0 });
    mockGet.mockReturnValue(raw);

    const note = createNote('u1');

    expect(note.id).toBe('mocked-id');
    expect(note.userId).toBe('u1');
    expect(note.isPublic).toBe(false);
    expect(note.publicSlug).toBeNull();
    expect(note.createdAt).toBeDefined();
  });

  it('uses nanoid for the note id', () => {
    mockNanoid.mockReturnValue('gen-id');
    mockGet.mockReturnValue(makeRawNote({ id: 'gen-id' }));

    createNote('u1');

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO notes'),
      expect.arrayContaining(['gen-id']),
    );
  });

  it('defaults title to "Untitled note" when not provided', () => {
    mockGet.mockReturnValue(makeRawNote({ title: 'Untitled note' }));

    createNote('u1');

    expect(mockRun).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['Untitled note']),
    );
  });

  it('uses provided title and contentJson', () => {
    const content = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });
    mockGet.mockReturnValue(makeRawNote({ title: 'My Note', content_json: content }));

    createNote('u1', { title: 'My Note', contentJson: content });

    expect(mockRun).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['My Note', content]),
    );
  });
});

describe('getNoteById', () => {
  it('returns a Note when found', () => {
    const raw = makeRawNote({ id: 'n1', user_id: 'u1', is_public: 1, public_slug: 'abc' });
    mockGet.mockReturnValue(raw);

    const note = getNoteById('u1', 'n1');

    expect(note).not.toBeNull();
    expect(note!.id).toBe('n1');
    expect(note!.isPublic).toBe(true);
    expect(note!.publicSlug).toBe('abc');
  });

  it('returns null when not found', () => {
    mockGet.mockReturnValue(undefined);

    expect(getNoteById('u1', 'missing')).toBeNull();
  });
});

describe('getNotesByUser', () => {
  it('returns an array of Notes', () => {
    mockQuery.mockReturnValue([makeRawNote({ id: 'a' }), makeRawNote({ id: 'b' })]);

    const notes = getNotesByUser('u1');

    expect(notes).toHaveLength(2);
    expect(notes[0].id).toBe('a');
    expect(notes[1].id).toBe('b');
    expect(notes[0].userId).toBe('user-1');
  });

  it('returns empty array when no notes', () => {
    mockQuery.mockReturnValue([]);

    expect(getNotesByUser('u1')).toEqual([]);
  });
});

describe('updateNote', () => {
  it('returns null when note not found', () => {
    mockGet.mockReturnValue(undefined);

    expect(updateNote('u1', 'missing', { title: 'New' })).toBeNull();
  });

  it('calls run with UPDATE SQL and returns updated Note', () => {
    const existing = makeRawNote({ id: 'n1', user_id: 'u1', title: 'Old' });
    const updated = makeRawNote({ id: 'n1', user_id: 'u1', title: 'New' });
    mockGet.mockReturnValueOnce(existing).mockReturnValueOnce(updated);

    const note = updateNote('u1', 'n1', { title: 'New' });

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE notes'),
      expect.arrayContaining(['New', 'n1', 'u1']),
    );
    expect(note!.title).toBe('New');
  });

  it('preserves existing title when only content is updated', () => {
    const existing = makeRawNote({ title: 'Kept Title' });
    const after = makeRawNote({ title: 'Kept Title', content_json: '{"type":"doc"}' });
    mockGet.mockReturnValueOnce(existing).mockReturnValueOnce(after);

    updateNote('u1', 'n1', { contentJson: '{"type":"doc"}' });

    expect(mockRun).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['Kept Title']),
    );
  });
});

describe('deleteNote', () => {
  it('calls run with DELETE SQL and correct params', () => {
    deleteNote('u1', 'n1');

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM notes'),
      expect.arrayContaining(['n1', 'u1']),
    );
  });

  it('does not throw when note does not exist', () => {
    expect(() => deleteNote('u1', 'missing')).not.toThrow();
  });
});

describe('setNotePublic', () => {
  it('returns null when note not found', () => {
    mockGet.mockReturnValue(undefined);

    expect(setNotePublic('u1', 'missing', true)).toBeNull();
  });

  it('generates a publicSlug via nanoid when enabling and no slug exists', () => {
    mockNanoid.mockReturnValue('slug-of-16-chars');
    const existing = makeRawNote({ public_slug: null });
    const after = makeRawNote({ is_public: 1, public_slug: 'slug-of-16-chars' });
    mockGet.mockReturnValueOnce(existing).mockReturnValueOnce(after);

    const note = setNotePublic('u1', 'n1', true);

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('is_public = 1'),
      expect.arrayContaining(['slug-of-16-chars']),
    );
    expect(note!.isPublic).toBe(true);
    expect(note!.publicSlug).toBe('slug-of-16-chars');
  });

  it('reuses existing publicSlug when already set', () => {
    const existing = makeRawNote({ public_slug: 'existing-slug' });
    const after = makeRawNote({ is_public: 1, public_slug: 'existing-slug' });
    mockGet.mockReturnValueOnce(existing).mockReturnValueOnce(after);

    setNotePublic('u1', 'n1', true);

    expect(mockNanoid).not.toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['existing-slug']),
    );
  });

  it('clears publicSlug and sets is_public=0 when disabling', () => {
    const existing = makeRawNote({ is_public: 1, public_slug: 'some-slug' });
    const after = makeRawNote({ is_public: 0, public_slug: null });
    mockGet.mockReturnValueOnce(existing).mockReturnValueOnce(after);

    const note = setNotePublic('u1', 'n1', false);

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('is_public = 0'),
      expect.not.arrayContaining(['some-slug']),
    );
    expect(note!.isPublic).toBe(false);
    expect(note!.publicSlug).toBeNull();
  });
});

describe('getNoteByPublicSlug', () => {
  it('returns a Note when slug matches a public note', () => {
    const raw = makeRawNote({ is_public: 1, public_slug: 'abc123' });
    mockGet.mockReturnValue(raw);

    const note = getNoteByPublicSlug('abc123');

    expect(note).not.toBeNull();
    expect(note!.isPublic).toBe(true);
  });

  it('returns null when slug not found', () => {
    mockGet.mockReturnValue(undefined);

    expect(getNoteByPublicSlug('no-such-slug')).toBeNull();
  });
});
