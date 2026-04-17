# CLAUDE.md

We are building the app described in @SPEC.MD. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No necessary fluff, no long code snippets.

Whenever working with any third party library or something similar , you MUST look up the official documentation to ensure that you're working with up-to-date information. Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev      # Start development server
bun run build    # Build production bundle
bun run lint     # Run ESLint
bun start        # Start production server
```

There is no test suite configured. The runtime is **Bun** — prefer `bun` over `npm`/`node` for running scripts.

## Project Overview

A note-taking web app where authenticated users create, edit, delete, and publicly share rich-text notes. The full specification is in `SPEC.MD` — consult it for data model details, endpoint contracts, component specs, and implementation order.

## Architecture

**Stack:** Next.js (App Router) + Bun + TypeScript + TailwindCSS v4 + SQLite (via Bun's SQLite client) + better-auth + TipTap editor

### Layer breakdown

| Layer                     | Location       | Responsibility                                                                                             |
| ------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| Pages & Server Components | `app/`         | Data fetching, auth checks, SSR                                                                            |
| API Route Handlers        | `app/api/`     | REST JSON endpoints (`/api/notes`, `/api/notes/[id]`, `/api/notes/[id]/share`, `/api/public-notes/[slug]`) |
| Repository                | `lib/notes.ts` | Note CRUD with raw SQL; every query filters by `user_id`                                                   |
| DB helper                 | `lib/db.ts`    | Singleton Bun SQLite connection; exports `query<T>`, `get<T>`, `run`                                       |
| Components                | `components/`  | `NoteList`, `NoteEditor`, `ShareToggle`, `DeleteNoteButton`, `PublicNoteViewer`                            |

### Key patterns

- **Server components** fetch data and enforce auth; **client components** handle TipTap and interactive UI.
- Every authenticated API route calls a session helper (via better-auth) and returns `401` if unauthenticated.
- All note SQL queries in auth context must include `WHERE user_id = ?` — never omit this.
- Note content is always stored as `JSON.stringify(tiptapEditor.getJSON())` and loaded back with `JSON.parse(contentJson)`.
- Public share slugs are generated with `nanoid()` (16+ chars); public notes are served at `/p/[slug]`.
- Never use `dangerouslySetInnerHTML` with note content — always render through TipTap's own renderer.

### Routes

| Route         | Auth     | Description                                |
| ------------- | -------- | ------------------------------------------ |
| `/`           | public   | Landing/marketing page                     |
| `/dashboard`  | required | Note list + create button                  |
| `/notes/[id]` | required | TipTap editor, title, share toggle, delete |
| `/p/[slug]`   | public   | Read-only note view                        |

### Database

SQLite file at `data/app.db` (path from `DB_PATH` env var). Schema defined in `SPEC.MD` §5. better-auth manages `user`, `session`, `account`, `verification` tables. The app owns the `notes` table with `content_json TEXT` column and a `public_slug TEXT UNIQUE` for sharing.

## Environment

Copy `.env.example` to `.env.local`:

```
BETTER_AUTH_SECRET=<32+ character secret>
DB_PATH=data/app.db
```
