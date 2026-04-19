import { Database, type SQLQueryBindings } from 'bun:sqlite';
import path from 'path';

const dbPath = process.env.DB_PATH ?? 'data/app.db';

// Ensure parent directory exists
import { mkdirSync } from 'fs';
mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath, { create: true });

db.run('PRAGMA busy_timeout = 5000;');
db.run('PRAGMA journal_mode = WAL;');
db.run('PRAGMA foreign_keys = ON;');

db.run(`
  CREATE TABLE IF NOT EXISTS user (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image         TEXT,
    createdAt     TEXT NOT NULL,
    updatedAt     TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS session (
    id          TEXT PRIMARY KEY,
    userId      TEXT NOT NULL,
    token       TEXT NOT NULL UNIQUE,
    expiresAt   TEXT NOT NULL,
    ipAddress   TEXT,
    userAgent   TEXT,
    createdAt   TEXT NOT NULL,
    updatedAt   TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS account (
    id                    TEXT PRIMARY KEY,
    userId                TEXT NOT NULL,
    accountId             TEXT NOT NULL,
    providerId            TEXT NOT NULL,
    accessToken           TEXT,
    refreshToken          TEXT,
    accessTokenExpiresAt  TEXT,
    refreshTokenExpiresAt TEXT,
    scope                 TEXT,
    idToken               TEXT,
    password              TEXT,
    createdAt             TEXT NOT NULL,
    updatedAt             TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS verification (
    id         TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value      TEXT NOT NULL,
    expiresAt  TEXT NOT NULL,
    createdAt  TEXT NOT NULL,
    updatedAt  TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL,
    title        TEXT NOT NULL,
    content_json TEXT NOT NULL,
    is_public    INTEGER NOT NULL DEFAULT 0,
    public_slug  TEXT UNIQUE,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
  )
`);

db.run('CREATE INDEX IF NOT EXISTS idx_notes_user_id     ON notes(user_id)');
db.run('CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug)');
db.run('CREATE INDEX IF NOT EXISTS idx_notes_is_public   ON notes(is_public)');

export function query<T>(sql: string, params: SQLQueryBindings[] = []): T[] {
  return db.query(sql).all(...params) as T[];
}

export function get<T>(sql: string, params: SQLQueryBindings[] = []): T | undefined {
  return db.query(sql).get(...params) as T | undefined;
}

export function run(sql: string, params: SQLQueryBindings[] = []): void {
  db.query(sql).run(...params);
}
